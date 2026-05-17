import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../utils/supabase'

export type ProgressStatus = 'en_cours' | 'termine' | 'planifie' | 'non_commence'

export interface CalendarEvent {
  id: string
  date: string
  title: string
  progress: ProgressStatus | null
  tags: string[] | null
  comment: string | null
}

export const useCalendarEventsStore = defineStore('calendarEvents', () => {
  const eventsByDate = ref<Record<string, CalendarEvent[]>>({})
  const loading = ref(false)

  async function loadMonth(year: number, month: number) {
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    loading.value = true
    const { data } = await supabase
      .from('calendar_events')
      .select()
      .gte('date', from)
      .lte('date', to)
      .order('created_at')

    if (data) {
      const map: Record<string, CalendarEvent[]> = {}
      for (const row of data) {
        if (!map[row.date]) map[row.date] = []
        map[row.date]!.push(row as CalendarEvent)
      }
      eventsByDate.value = { ...eventsByDate.value, ...map }
    }
    loading.value = false
  }

  async function saveEvent(event: Omit<CalendarEvent, 'id'> & { id?: string }) {
    if (event.id) {
      const { data } = await supabase
        .from('calendar_events')
        .update({
          title: event.title,
          progress: event.progress,
          tags: event.tags,
          comment: event.comment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id)
        .select()
        .single()
      if (data) _upsertLocal(data as CalendarEvent)
    } else {
      const { data } = await supabase
        .from('calendar_events')
        .insert({
          date: event.date,
          title: event.title,
          progress: event.progress,
          tags: event.tags,
          comment: event.comment,
        })
        .select()
        .single()
      if (data) _upsertLocal(data as CalendarEvent)
    }
  }

  async function deleteEvent(id: string, date: string) {
    await supabase.from('calendar_events').delete().eq('id', id)
    if (eventsByDate.value[date]) {
      eventsByDate.value[date] = eventsByDate.value[date].filter((e) => e.id !== id)
    }
  }

  function _upsertLocal(event: CalendarEvent) {
    const list = eventsByDate.value[event.date] ?? []
    const idx = list.findIndex((e) => e.id === event.id)
    if (idx >= 0) list[idx] = event
    else list.push(event)
    eventsByDate.value[event.date] = [...list]
  }

  function getEventsForDate(dateStr: string): CalendarEvent[] {
    return eventsByDate.value[dateStr] ?? []
  }

  return { eventsByDate, loading, loadMonth, saveEvent, deleteEvent, getEventsForDate }
})
