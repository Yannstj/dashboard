import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../utils/supabase'

const DEFAULT_COLUMNS = [
  { name: 'Make bed', is_text: false, position: 0 },
  { name: 'Sport',    is_text: false, position: 1 },
  { name: 'Meditate', is_text: false, position: 2 },
  { name: 'Read',     is_text: false, position: 3 },
  { name: 'Write',    is_text: false, position: 4 },
  { name: 'Vitamins', is_text: false, position: 5 },
  { name: 'Yoga',     is_text: false, position: 6 },
  { name: 'Post',     is_text: false, position: 7 },
  { name: 'Name',     is_text: true,  position: 8 },
]

export interface TrackColumn {
  id: string
  name: string
  position: number
  is_text: boolean
}

export interface PriorityHabit {
  id: string
  name: string
  icon: string
  position: number
}

type CompletionMap = Record<string, Record<string, { checked: boolean; text: string }>>

export const useHabitsStore = defineStore('habits', () => {
  const columns = ref<TrackColumn[]>([])
  const completions = ref<CompletionMap>({})
  const priorityHabits = ref<PriorityHabit[]>([])

  // --- Colonnes du tableau ---
  async function loadColumns() {
    const { data, error } = await supabase.from('habits').select().order('position')
    if (error) { console.error(error); return }
    const list = (data as TrackColumn[]) ?? []
    if (list.length === 0) {
      await seedDefaults()
    } else {
      columns.value = list
    }
  }

  async function seedDefaults() {
    const { data, error } = await supabase.from('habits').insert(DEFAULT_COLUMNS).select().order('position')
    if (error) { console.error(error); return }
    columns.value = (data as TrackColumn[]) ?? []
  }

  async function addColumn() {
    const position = columns.value.length
    const { data, error } = await supabase
      .from('habits')
      .insert({ name: 'Nouvelle habitude', is_text: false, position })
      .select()
      .single()
    if (error) { console.error(error); return }
    if (data) columns.value.push(data as TrackColumn)
  }

  async function updateColumn(id: string, name: string) {
    const idx = columns.value.findIndex((c) => c.id === id)
    if (idx < 0) return
    columns.value[idx]!.name = name
    await supabase.from('habits').update({ name }).eq('id', id)
  }

  // --- Completions ---
  async function loadCompletions(year: number, month: number) {
    const pad = (n: number) => String(n).padStart(2, '0')
    const lastDay = new Date(year, month, 0).getDate()
    const start = `${year}-${pad(month)}-01`
    const end = `${year}-${pad(month)}-${pad(lastDay)}`
    const { data, error } = await supabase
      .from('habit_completions')
      .select('habit_id, date, text_value')
      .gte('date', start)
      .lte('date', end)
    if (error) { console.error(error); return }
    const map: CompletionMap = {}
    for (const row of data ?? []) {
      if (!map[row.habit_id]) map[row.habit_id] = {}
      map[row.habit_id]![row.date] = { checked: true, text: row.text_value ?? '' }
    }
    completions.value = map
  }

  async function toggleCheck(columnId: string, dateStr: string) {
    if (!completions.value[columnId]) completions.value[columnId] = {}
    const entry = completions.value[columnId]![dateStr]
    if (entry?.checked) {
      delete completions.value[columnId]![dateStr]
      await supabase.from('habit_completions').delete().eq('habit_id', columnId).eq('date', dateStr)
    } else {
      completions.value[columnId]![dateStr] = { checked: true, text: '' }
      await supabase
        .from('habit_completions')
        .upsert({ habit_id: columnId, date: dateStr, text_value: null }, { onConflict: 'habit_id,date' })
    }
  }

  async function updateText(columnId: string, dateStr: string, text: string) {
    if (!completions.value[columnId]) completions.value[columnId] = {}
    if (!text.trim()) {
      delete completions.value[columnId]![dateStr]
      await supabase.from('habit_completions').delete().eq('habit_id', columnId).eq('date', dateStr)
      return
    }
    completions.value[columnId]![dateStr] = { checked: true, text }
    await supabase
      .from('habit_completions')
      .upsert({ habit_id: columnId, date: dateStr, text_value: text }, { onConflict: 'habit_id,date' })
  }

  const isChecked = computed(
    () => (columnId: string, dateStr: string) =>
      completions.value[columnId]?.[dateStr]?.checked ?? false,
  )

  const getText = computed(
    () => (columnId: string, dateStr: string) =>
      completions.value[columnId]?.[dateStr]?.text ?? '',
  )

  // --- Priority Habits (indépendants) ---
  async function loadPriorityHabits() {
    const { data, error } = await supabase.from('priority_habits').select().order('position')
    if (error) { console.error(error); return }
    priorityHabits.value = (data as PriorityHabit[]) ?? []
  }

  async function addPriorityHabit() {
    const position = priorityHabits.value.length
    const { data, error } = await supabase
      .from('priority_habits')
      .insert({ name: 'New habit', icon: '✅', position })
      .select()
      .single()
    if (error) { console.error(error); return }
    if (data) priorityHabits.value.push(data as PriorityHabit)
  }

  async function updatePriorityHabit(id: string, patch: Partial<Pick<PriorityHabit, 'name' | 'icon'>>) {
    const idx = priorityHabits.value.findIndex((h) => h.id === id)
    if (idx < 0) return
    Object.assign(priorityHabits.value[idx]!, patch)
    await supabase.from('priority_habits').update(patch).eq('id', id)
  }

  async function deletePriorityHabit(id: string) {
    priorityHabits.value = priorityHabits.value.filter((h) => h.id !== id)
    await supabase.from('priority_habits').delete().eq('id', id)
  }

  return {
    columns,
    completions,
    priorityHabits,
    loadColumns,
    addColumn,
    updateColumn,
    loadCompletions,
    toggleCheck,
    updateText,
    isChecked,
    getText,
    loadPriorityHabits,
    addPriorityHabit,
    updatePriorityHabit,
    deletePriorityHabit,
  }
})
