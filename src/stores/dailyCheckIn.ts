import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { supabase } from '../utils/supabase'

interface Habit {
  id: number
  label: string
  done: boolean
}

interface Meals {
  breakfast: string
  lunch: string
  dinner: string
  snacks: string
}

export const useDailyCheckInStore = defineStore('dailyCheckIn', () => {
  const today = new Date().toISOString().split('T')[0]

  const gratitude = ref('')
  const affirmation = ref('')
  const morningHabits = ref<Habit[]>([{ id: 1, label: 'Tâche', done: false }])
  const eveningHabits = ref<Habit[]>([{ id: 1, label: 'Tâche', done: false }])
  const meals = ref<Meals>({ breakfast: '', lunch: '', dinner: '', snacks: '' })

  const saving = ref(false)
  const saved = ref(false)
  const loading = ref(false)

  let nextId = 2
  let loaded = false
  let saveTimeout: ReturnType<typeof setTimeout> | null = null

  async function load() {
    loading.value = true
    const { data } = await supabase
      .from('daily_checkins')
      .select()
      .eq('date', today)
      .maybeSingle()

    if (data) {
      gratitude.value = data.gratitude ?? ''
      affirmation.value = data.affirmation ?? ''
      morningHabits.value = data.morning_habits?.length
        ? data.morning_habits
        : [{ id: 1, label: 'Tâche', done: false }]
      eveningHabits.value = data.evening_habits?.length
        ? data.evening_habits
        : [{ id: 1, label: 'Tâche', done: false }]
      meals.value = data.meals ?? { breakfast: '', lunch: '', dinner: '', snacks: '' }

      const allIds = [...morningHabits.value, ...eveningHabits.value].map((h) => h.id)
      nextId = Math.max(...allIds, 1) + 1
    }

    loading.value = false
    loaded = true
  }

  async function save() {
    saving.value = true
    saved.value = false

    await supabase.from('daily_checkins').upsert(
      {
        date: today,
        gratitude: gratitude.value,
        affirmation: affirmation.value,
        morning_habits: morningHabits.value,
        evening_habits: eveningHabits.value,
        meals: meals.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'date' },
    )

    saving.value = false
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 2000)
  }

  function scheduleSave() {
    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(save, 1000)
  }

  watch([gratitude, affirmation, morningHabits, eveningHabits, meals], () => {
    if (!loaded) return
    scheduleSave()
  }, { deep: true })

  function addMorningHabit() {
    morningHabits.value.push({ id: nextId++, label: 'Nouvelle habitude', done: false })
  }

  function addEveningHabit() {
    eveningHabits.value.push({ id: nextId++, label: 'Nouvelle habitude', done: false })
  }

  return {
    gratitude,
    affirmation,
    morningHabits,
    eveningHabits,
    meals,
    saving,
    saved,
    loading,
    load,
    save,
    addMorningHabit,
    addEveningHabit,
  }
})
