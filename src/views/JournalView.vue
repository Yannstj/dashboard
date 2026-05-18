<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useJournalStore, type JournalEntry } from '../stores/journal'

const store = useJournalStore()

const openEntry = ref<JournalEntry | null>(null)

let titleTimeout: ReturnType<typeof setTimeout> | null = null
let contentTimeout: ReturnType<typeof setTimeout> | null = null
let tagsTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => store.loadEntries())

async function handleNewEntry() {
  const entry = await store.addEntry()
  if (entry) openEntry.value = entry
}

function closeModal() {
  openEntry.value = null
  titleTimeout && clearTimeout(titleTimeout)
  contentTimeout && clearTimeout(contentTimeout)
  tagsTimeout && clearTimeout(tagsTimeout)
}

function onTitleInput(e: Event) {
  if (!openEntry.value) return
  const val = (e.target as HTMLInputElement).value
  openEntry.value.title = val
  if (titleTimeout) clearTimeout(titleTimeout)
  titleTimeout = setTimeout(() => {
    store.updateEntry(openEntry.value!.id, { title: val })
  }, 800)
}

function onContentInput(e: Event) {
  if (!openEntry.value) return
  const val = (e.target as HTMLTextAreaElement).value
  openEntry.value.content = val
  if (contentTimeout) clearTimeout(contentTimeout)
  contentTimeout = setTimeout(() => {
    store.updateEntry(openEntry.value!.id, { content: val })
  }, 800)
}

function onTagsBlur(e: FocusEvent) {
  if (!openEntry.value) return
  const val = (e.target as HTMLInputElement).value
  openEntry.value.tags = val
  if (tagsTimeout) clearTimeout(tagsTimeout)
  tagsTimeout = setTimeout(() => {
    store.updateEntry(openEntry.value!.id, { tags: val })
  }, 800)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openModal(entry: JournalEntry) {
  openEntry.value = { ...entry }
}
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <!-- Banner -->
    <div
      class="w-full h-[200px]"
      style="background: linear-gradient(135deg, #c5cde8 0%, #d4daf0 50%, #dde2f5 100%)"
    />

    <!-- Title -->
    <div class="mx-6 mt-4 mb-2">
      <div class="text-gray-700 font-bold" style="font-size: 60px; line-height: 1">🧿</div>
      <h1 class="text-[2.5rem] font-bold text-gray-900 mt-1">Journal</h1>
    </div>

    <!-- Main layout -->
    <div class="flex gap-6 mx-6 mt-6 mb-10">
      <!-- Left column: aesthetic cards -->
      <div class="w-44 shrink-0 flex flex-col gap-3">
        <div class="h-36 rounded-xl overflow-hidden bg-gray-100" />
        <div
          class="h-36 rounded-xl overflow-hidden bg-stone-700 text-white flex flex-col items-center justify-center gap-1"
        >
          <span class="text-2xl">🌙</span>
          <span class="text-xs font-semibold tracking-wide">Do Not Disturb</span>
          <span class="text-xs text-stone-300">On</span>
        </div>
        <div class="h-36 rounded-xl overflow-hidden bg-slate-600" />
      </div>

      <!-- Center column: entry list -->
      <div class="w-136 shrink-0">
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold text-gray-800">All My Thoughts</span>
          <button
            @click="handleNewEntry"
            class="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700 transition-colors"
          >
            Nouveau
          </button>
        </div>

        <div class="flex flex-col">
          <div
            v-for="entry in store.entries"
            :key="entry.id"
            class="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
            @click="openModal(entry)"
          >
            <!-- Document icon -->
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              class="shrink-0 text-gray-400"
            >
              <path
                d="M4 2h6l3 3v9H4V2z"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
                fill="none"
              />
              <path
                d="M10 2v3h3"
                stroke="currentColor"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
              <path
                d="M6 7h5M6 9.5h5M6 12h3"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="round"
              />
            </svg>
            <span class="text-sm text-gray-700 flex-1 truncate">{{
              entry.title || 'Nouvelle page'
            }}</span>
            <button
              class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:text-red-500 text-gray-400"
              @click.stop="store.deleteEntry(entry.id)"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4l.7 9h6.6L12 4"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          @click="handleNewEntry"
          class="flex items-center gap-1 mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span>+</span>
          <span>Nouvelle page</span>
        </button>
      </div>

      <!-- Right column: Spotify widget (à venir) -->
      <div class="w-72 shrink-0 hidden">
        <div class="rounded-2xl overflow-hidden" style="background-color: #5c2333">
          <!-- Top section -->
          <div class="p-5">
            <!-- Spotify logo top-right -->
            <div class="flex justify-end mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path
                  d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.077-.495 9.712 1.115a.622.622 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.786-2.131-9.965-1.166a.78.78 0 01-.972-.519.78.78 0 01.519-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.866 13.115 1.338a.937.937 0 01-.955 1.613z"
                />
              </svg>
            </div>

            <!-- Album art + info -->
            <div class="flex gap-4 items-start">
              <div class="w-[120px] h-[120px] rounded-lg bg-pink-300 shrink-0" />
              <div class="flex flex-col gap-1 pt-1">
                <span class="text-white font-bold text-xl leading-tight">journaling</span>
                <div class="flex items-center gap-1 mt-1">
                  <span class="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full"
                    >Extrait</span
                  >
                </div>
                <span class="text-gray-300 text-sm mt-0.5">Flourish Planner</span>
                <span
                  class="text-gray-300 text-sm flex items-center gap-1 mt-1 cursor-pointer hover:text-white transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                  Ajouter sur Spotify
                </span>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center gap-4 mt-4 justify-center">
              <button class="text-white/70 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>
              <button
                class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#5c2333">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <button class="text-white/70 hover:text-white transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Song list -->
          <div style="background-color: #4a1c2a">
            <div
              v-for="(song, i) in [
                { title: 'Slow', artist: 'Domknowz', duration: '2:49' },
                { title: 'bloom', artist: 'S N U G', duration: '2:37' },
                { title: 'Cozy Beat', artist: 'Aesthetic Sounds', duration: '1:26' },
                { title: 'another perspective', artist: 'Idealism', duration: '2:46' },
                { title: 'Blooming Dales', artist: 'Krynoze Diiolme', duration: '2:46' },
                { title: 'Dormant', artist: 'Kurt Stewart', duration: '2:08' },
              ]"
              :key="i"
              class="flex items-center px-5 py-2.5 hover:bg-white/5 transition-colors divide-white/10"
              :class="i > 0 ? 'border-t border-white/10' : ''"
            >
              <span class="text-gray-400 text-xs w-5">{{ i + 1 }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-white text-sm truncate">{{ song.title }}</div>
                <div class="text-gray-400 text-xs truncate">{{ song.artist }}</div>
              </div>
              <span class="text-gray-400 text-xs ml-auto">{{ song.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Entry Modal -->
  <Teleport to="body">
    <div
      v-if="openEntry"
      class="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto pt-16 pb-16"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 p-8 relative">
        <!-- Close button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M2 2l14 14M16 2 2 16"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <!-- Title input -->
        <input
          :value="openEntry.title"
          @input="onTitleInput"
          placeholder="Nouvelle page"
          class="w-full text-4xl font-bold outline-none border-none bg-transparent placeholder-gray-300 text-gray-800"
        />

        <!-- Properties -->
        <div class="mt-4 space-y-2">
          <div class="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              class="text-gray-400 shrink-0"
            >
              <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3" />
              <path
                d="M8 5v3.5l2 2"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            <span class="text-gray-500 text-sm w-28">Created</span>
            <span class="text-gray-700 text-sm">{{ formatDate(openEntry.created_at) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              class="text-gray-400 shrink-0"
            >
              <rect
                x="2"
                y="3"
                width="12"
                height="10"
                rx="1"
                stroke="currentColor"
                stroke-width="1.3"
              />
              <path
                d="M5 7h6M5 10h4"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
            <span class="text-gray-500 text-sm w-28">Tags</span>
            <input
              :value="openEntry.tags"
              @blur="onTagsBlur"
              placeholder="Vide"
              class="text-gray-600 text-sm outline-none border-none bg-transparent placeholder-gray-400 flex-1"
            />
          </div>
        </div>

        <hr class="mt-4 mb-4 border-gray-100" />

        <!-- Content textarea -->
        <textarea
          :value="openEntry.content"
          @input="onContentInput"
          placeholder="Commencez à écrire..."
          class="w-full min-h-64 resize-none outline-none border-none bg-transparent text-gray-700 text-sm leading-relaxed placeholder-gray-300"
        />
      </div>
    </div>
  </Teleport>
</template>
