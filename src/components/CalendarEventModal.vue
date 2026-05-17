<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCalendarEventsStore, type CalendarEvent, type ProgressStatus } from '../stores/calendarEvents'

const props = defineProps<{
  date: string
  event?: CalendarEvent | null
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useCalendarEventsStore()

const title = ref(props.event?.title ?? '')
const progress = ref<ProgressStatus | null>(props.event?.progress ?? null)
const selectedTags = ref<string[]>(props.event?.tags ?? [])
const comment = ref(props.event?.comment ?? '')
const saving = ref(false)
const showProgressDropdown = ref(false)
const showTagsDropdown = ref(false)

watch(() => props.event, (e) => {
  title.value = e?.title ?? ''
  progress.value = e?.progress ?? null
  selectedTags.value = e?.tags ?? []
  comment.value = e?.comment ?? ''
})

// --- Progress ---
const progressOptions: { value: ProgressStatus; label: string; bg: string; color: string }[] = [
  { value: 'en_cours',      label: 'En cours',       bg: '#fde8d0', color: '#b45309' },
  { value: 'termine',       label: 'Terminé',         bg: '#d1f0d8', color: '#276135' },
  { value: 'planifie',      label: 'Planifié',        bg: '#dbeafe', color: '#1d4ed8' },
  { value: 'non_commence',  label: 'Non commencé',    bg: '#fce8e8', color: '#b91c1c' },
]

function getProgressOption(v: ProgressStatus | null) {
  return progressOptions.find((o) => o.value === v) ?? null
}

function selectProgress(v: ProgressStatus) {
  progress.value = v
  showProgressDropdown.value = false
}

function toggleProgressDropdown() {
  showProgressDropdown.value = !showProgressDropdown.value
  if (showProgressDropdown.value) showTagsDropdown.value = false
}

function toggleTagsDropdown() {
  showTagsDropdown.value = !showTagsDropdown.value
  if (showTagsDropdown.value) showProgressDropdown.value = false
}

// --- Tags ---
const tagOptions: { value: string; label: string; bg: string; color: string }[] = [
  { value: 'sport',        label: 'Sport',        bg: '#d1f0d8', color: '#276135' },
  { value: 'sante',        label: 'Santé',        bg: '#ccf0ee', color: '#0d6e69' },
  { value: 'travail',      label: 'Travail',      bg: '#dbeafe', color: '#1d4ed8' },
  { value: 'perso',        label: 'Perso',        bg: '#ede9fe', color: '#6d28d9' },
  { value: 'famille',      label: 'Famille',      bg: '#fce7f3', color: '#be185d' },
  { value: 'rendez-vous',  label: 'Rendez-vous',  bg: '#fde8d0', color: '#b45309' },
  { value: 'objectif',     label: 'Objectif',     bg: '#fef9c3', color: '#854d0e' },
  { value: 'rappel',       label: 'Rappel',       bg: '#fce8e8', color: '#b91c1c' },
]

function getTagOption(v: string) {
  return tagOptions.find((t) => t.value === v)
}

function toggleTag(v: string) {
  const idx = selectedTags.value.indexOf(v)
  if (idx >= 0) selectedTags.value.splice(idx, 1)
  else selectedTags.value.push(v)
}

function removeTag(v: string) {
  selectedTags.value = selectedTags.value.filter((t) => t !== v)
}

// --- Utils ---
function formatDate(dateStr: string) {
  const parts = dateStr.split('-').map(Number)
  const [year, month, day] = parts as [number, number, number]
  const monthNames = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  return `${day} ${monthNames[month - 1]} ${year}`
}

async function handleSave() {
  if (!title.value.trim()) return
  saving.value = true
  await store.saveEvent({
    id: props.event?.id,
    date: props.date,
    title: title.value.trim(),
    progress: progress.value,
    tags: selectedTags.value.length ? selectedTags.value : null,
    comment: comment.value || null,
  })
  saving.value = false
  emit('close')
}

async function handleDelete() {
  if (!props.event) return
  await store.deleteEvent(props.event.id, props.date)
  emit('close')
}

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-backdrop')) emit('close')
}

function closeDropdowns() {
  showProgressDropdown.value = false
  showTagsDropdown.value = false
}
</script>

<template>
  <Teleport to="body">
    <div
      class="modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="onBackdropClick"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto flex flex-col"
        @click="closeDropdowns"
      >
        <!-- Top bar -->
        <div class="flex items-center justify-between px-6 pt-4 pb-2">
          <div class="flex gap-2 text-gray-400">
            <button class="p-1 hover:bg-gray-100 rounded" title="Agrandir">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5-5-5m5 5v-4m0 4h-4"/>
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="event"
              @click="handleDelete"
              class="text-xs text-red-400 hover:text-red-600 px-2 py-1 hover:bg-red-50 rounded transition-colors"
            >
              Supprimer
            </button>
            <button @click="emit('close')" class="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Title -->
        <div class="px-10 pt-4 pb-2">
          <div class="flex items-start">
            <div class="w-1 self-stretch bg-gray-300 rounded mr-3 mt-1 shrink-0" />
            <input
              v-model="title"
              type="text"
              placeholder="Nouvelle page"
              class="w-full text-4xl font-bold text-gray-700 placeholder-gray-300 outline-none bg-transparent leading-tight"
              @keydown.enter.prevent="handleSave"
            />
          </div>
        </div>

        <!-- Properties -->
        <div class="px-10 py-4 flex flex-col gap-1">
          <!-- Date -->
          <div class="flex items-center gap-4 py-1.5">
            <div class="flex items-center gap-2 w-32 text-gray-400 text-sm shrink-0">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Date</span>
            </div>
            <span class="text-sm text-gray-700">{{ formatDate(date) }}</span>
          </div>

          <!-- Progress -->
          <div class="flex items-center gap-4 py-1.5 relative" @click.stop>
            <div class="flex items-center gap-2 w-32 text-gray-400 text-sm shrink-0">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              <span>Progression</span>
            </div>
            <button @click="toggleProgressDropdown" class="text-sm flex items-center gap-2">
              <span
                v-if="getProgressOption(progress)"
                class="px-2 py-0.5 rounded text-xs font-medium"
                :style="{ backgroundColor: getProgressOption(progress)!.bg, color: getProgressOption(progress)!.color }"
              >{{ getProgressOption(progress)!.label }}</span>
              <span v-else class="text-gray-300">Vide</span>
            </button>
            <div
              v-if="showProgressDropdown"
              class="absolute left-32 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-52 p-2"
            >
              <p class="text-xs text-gray-400 px-1 mb-1">Sélectionner une option</p>
              <button
                v-for="opt in progressOptions"
                :key="opt.value"
                @click="selectProgress(opt.value)"
                class="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded transition-colors"
              >
                <span class="w-3.5 h-3.5 flex items-center justify-center text-gray-300 text-xs">✓</span>
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :style="{ backgroundColor: opt.bg, color: opt.color }"
                >{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Tags -->
          <div class="flex items-start gap-4 py-1.5 relative" @click.stop>
            <div class="flex items-center gap-2 w-32 text-gray-400 text-sm shrink-0 pt-0.5">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z"/>
              </svg>
              <span>Tags</span>
            </div>
            <div class="flex flex-wrap gap-1 flex-1 min-h-[28px]">
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                :style="getTagOption(tag) ? { backgroundColor: getTagOption(tag)!.bg, color: getTagOption(tag)!.color } : { backgroundColor: '#f3f4f6', color: '#6b7280' }"
              >
                {{ getTagOption(tag)?.label ?? tag }}
                <button @click="removeTag(tag)" class="ml-0.5 opacity-60 hover:opacity-100 leading-none">×</button>
              </span>
              <button
                @click="toggleTagsDropdown"
                class="px-2 py-0.5 rounded text-xs text-gray-300 hover:bg-gray-100 hover:text-gray-500 transition-colors"
              >
                {{ selectedTags.length ? '+ Ajouter' : 'Vide' }}
              </button>
            </div>
            <!-- Tags dropdown -->
            <div
              v-if="showTagsDropdown"
              class="absolute left-32 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-56 p-2"
            >
              <p class="text-xs text-gray-400 px-1 mb-1">Sélectionner ou créer un tag</p>
              <button
                v-for="opt in tagOptions"
                :key="opt.value"
                @click="toggleTag(opt.value)"
                class="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded transition-colors"
              >
                <span class="w-3.5 h-3.5 flex items-center justify-center text-xs" :class="selectedTags.includes(opt.value) ? 'text-gray-700' : 'text-transparent'">✓</span>
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :style="{ backgroundColor: opt.bg, color: opt.color }"
                >{{ opt.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="mx-10 border-t border-gray-100" />

        <!-- Comments -->
        <div class="px-10 py-4">
          <p class="text-sm font-semibold text-gray-700 mb-3">Commentaires</p>
          <textarea
            v-model="comment"
            placeholder="Ajouter un commentaire..."
            rows="3"
            class="w-full text-sm text-gray-500 placeholder-gray-300 outline-none bg-transparent resize-none"
          />
        </div>

        <!-- Footer -->
        <div class="px-10 pb-6 flex items-center justify-between">
          <p class="text-xs text-gray-300">Appuyez sur Entrée pour sauvegarder</p>
          <div class="flex gap-2">
            <button
              @click="emit('close')"
              class="text-sm px-4 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
            >Annuler</button>
            <button
              @click="handleSave"
              :disabled="saving || !title.trim()"
              class="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >{{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
