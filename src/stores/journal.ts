// CREATE TABLE journal_entries (id uuid primary key default gen_random_uuid(), title text not null default 'Nouvelle page', content text not null default '', tags text not null default '', created_at timestamptz default now(), updated_at timestamptz default now());
// CREATE POLICY "allow_all_journal" ON journal_entries FOR ALL USING (true) WITH CHECK (true);

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../utils/supabase'

export interface JournalEntry {
  id: string
  title: string
  content: string
  tags: string
  created_at: string
  updated_at: string
}

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([])

  async function loadEntries() {
    const { data } = await supabase
      .from('journal_entries')
      .select()
      .order('created_at', { ascending: false })
    entries.value = (data as JournalEntry[]) ?? []
  }

  async function addEntry(): Promise<JournalEntry | null> {
    const { data } = await supabase
      .from('journal_entries')
      .insert({})
      .select()
      .single()
    if (!data) return null
    const entry = data as JournalEntry
    entries.value.unshift(entry)
    return entry
  }

  const updateTimeouts: Record<string, ReturnType<typeof setTimeout>> = {}

  function updateEntry(id: string, patch: { title?: string; content?: string; tags?: string }) {
    const idx = entries.value.findIndex((e) => e.id === id)
    if (idx < 0) return
    Object.assign(entries.value[idx]!, patch)
    entries.value[idx]!.updated_at = new Date().toISOString()

    if (updateTimeouts[id]) clearTimeout(updateTimeouts[id])
    updateTimeouts[id] = setTimeout(async () => {
      await supabase
        .from('journal_entries')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
      delete updateTimeouts[id]
    }, 800)
  }

  async function deleteEntry(id: string) {
    entries.value = entries.value.filter((e) => e.id !== id)
    await supabase.from('journal_entries').delete().eq('id', id)
  }

  return {
    entries,
    loadEntries,
    addEntry,
    updateEntry,
    deleteEntry,
  }
})
