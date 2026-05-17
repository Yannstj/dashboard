import { defineStore } from 'pinia'
import { ref, watch, computed } from 'vue'
import { supabase } from '../utils/supabase'

export interface Highlight {
  id: number
  emoji: string
  text: string
}

export interface Task {
  id: number
  label: string
  done: boolean
}

export interface DayData {
  highlights: Highlight[]
  tasks: Task[]
}

export type DayKey = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'weekend'

export interface WeekData {
  lundi: DayData
  mardi: DayData
  mercredi: DayData
  jeudi: DayData
  vendredi: DayData
  weekend: DayData
}

export interface MasterTodo {
  id: string
  label: string
  done: boolean
  position: number
}

function emptyDay(): DayData {
  return { highlights: [], tasks: [] }
}

function emptyWeek(): WeekData {
  return {
    lundi: emptyDay(),
    mardi: emptyDay(),
    mercredi: emptyDay(),
    jeudi: emptyDay(),
    vendredi: emptyDay(),
    weekend: emptyDay(),
  }
}

function getWeekStart(date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]!
}

export const usePlannerStore = defineStore('planner', () => {
  const currentWeekStart = computed(() => getWeekStart())

  const masterTodos = ref<MasterTodo[]>([])
  const weekData = ref<WeekData>(emptyWeek())

  const loadingMaster = ref(false)
  const loadingWeek = ref(false)
  let weekLoaded = false
  let nextId = 1
  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  // --- Master Todos ---
  async function loadMasterTodos() {
    loadingMaster.value = true
    const { data } = await supabase
      .from('planner_master_todos')
      .select()
      .order('position')
    masterTodos.value = (data as MasterTodo[]) ?? []
    loadingMaster.value = false
  }

  async function addMasterTodo() {
    const position = masterTodos.value.length
    const { data } = await supabase
      .from('planner_master_todos')
      .insert({ label: 'Tâche', done: false, position })
      .select()
      .single()
    if (data) masterTodos.value.push(data as MasterTodo)
  }

  async function updateMasterTodo(id: string, patch: Partial<Pick<MasterTodo, 'label' | 'done'>>) {
    const idx = masterTodos.value.findIndex((t) => t.id === id)
    if (idx < 0) return
    Object.assign(masterTodos.value[idx]!, patch)
    await supabase.from('planner_master_todos').update(patch).eq('id', id)
  }

  async function deleteMasterTodo(id: string) {
    masterTodos.value = masterTodos.value.filter((t) => t.id !== id)
    await supabase.from('planner_master_todos').delete().eq('id', id)
  }

  // --- Week Data ---
  async function loadWeek() {
    loadingWeek.value = true
    const { data } = await supabase
      .from('planner_weeks')
      .select()
      .eq('week_start', currentWeekStart.value)
      .maybeSingle()

    if (data?.data) {
      weekData.value = { ...emptyWeek(), ...data.data }
    } else {
      weekData.value = emptyWeek()
    }

    // compute nextId from loaded data
    let max = 0
    for (const day of Object.values(weekData.value)) {
      for (const h of day.highlights) if (h.id > max) max = h.id
      for (const t of day.tasks) if (t.id > max) max = t.id
    }
    nextId = max + 1

    loadingWeek.value = false
    weekLoaded = true
  }

  async function saveWeek() {
    await supabase.from('planner_weeks').upsert(
      { week_start: currentWeekStart.value, data: weekData.value, updated_at: new Date().toISOString() },
      { onConflict: 'week_start' },
    )
  }

  function scheduleWeekSave() {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(saveWeek, 1000)
  }

  watch(weekData, () => { if (weekLoaded) scheduleWeekSave() }, { deep: true })

  // --- Day mutations ---
  function addHighlight(day: DayKey) {
    weekData.value[day].highlights.push({ id: nextId++, emoji: '✨', text: '' })
  }

  function removeHighlight(day: DayKey, id: number) {
    weekData.value[day].highlights = weekData.value[day].highlights.filter((h) => h.id !== id)
  }

  function addTask(day: DayKey) {
    weekData.value[day].tasks.push({ id: nextId++, label: 'Tâche', done: false })
  }

  function removeTask(day: DayKey, id: number) {
    weekData.value[day].tasks = weekData.value[day].tasks.filter((t) => t.id !== id)
  }

  return {
    currentWeekStart,
    masterTodos,
    weekData,
    loadingMaster,
    loadingWeek,
    loadMasterTodos,
    addMasterTodo,
    updateMasterTodo,
    deleteMasterTodo,
    loadWeek,
    addHighlight,
    removeHighlight,
    addTask,
    removeTask,
  }
})
