<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useHabitsStore } from '../stores/habits'

const store = useHabitsStore()

const vFocus = {
  mounted: (el: HTMLElement) => nextTick(() => el.focus()),
}

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)

const pad = (n: number) => String(n).padStart(2, '0')

const days = computed(() => {
  const count = new Date(currentYear.value, currentMonth.value, 0).getDate()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(currentYear.value, currentMonth.value - 1, i + 1)
    return {
      num: i + 1,
      short: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dateStr: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      isToday:
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate(),
    }
  })
})

// --- Date picker ---
const pickerOpen = ref(false)
const pickerYear = ref(currentYear.value)
const pickerMonth = ref(currentMonth.value)

function openPicker() {
  pickerYear.value = currentYear.value
  pickerMonth.value = currentMonth.value
  pickerOpen.value = true
}

function applyPicker() {
  currentYear.value = pickerYear.value
  currentMonth.value = pickerMonth.value
  pickerOpen.value = false
  store.loadCompletions(currentYear.value, currentMonth.value)
}

function prevPickerMonth() {
  if (pickerMonth.value === 1) { pickerMonth.value = 12; pickerYear.value-- }
  else pickerMonth.value--
}
function nextPickerMonth() {
  if (pickerMonth.value === 12) { pickerMonth.value = 1; pickerYear.value++ }
  else pickerMonth.value++
}


// --- Column header editing ---
const editingColId = ref<string | null>(null)
const editingColName = ref('')

function startEditCol(id: string, currentName: string) {
  editingColId.value = id
  editingColName.value = currentName
}

function saveCol(id: string) {
  store.updateColumn(id, editingColName.value.trim() || 'Habitude')
  editingColId.value = null
}

function onColKeydown(id: string, e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); saveCol(id) }
  if (e.key === 'Escape') editingColId.value = null
}

// --- Text cell editing ---
function onTextBlur(columnId: string, dateStr: string, e: FocusEvent) {
  const el = e.target as HTMLElement
  store.updateText(columnId, dateStr, el.innerText.trim())
}

// --- Emoji picker ---
const EMOJIS = [
  '✅','🏃','🧘','📖','✍️','💊','🧪','🥗','💪','🎯',
  '🌅','☕','🛏️','🚿','🧹','💧','🥦','🍎','😴','🎵',
  '📝','🎨','🧠','❤️','🌿','⭐','🔥','💡','🏋️','🚴',
]
const emojiPickerHabitId = ref<string | null>(null)

function toggleEmojiPicker(id: string) {
  emojiPickerHabitId.value = emojiPickerHabitId.value === id ? null : id
}

function pickEmoji(id: string, emoji: string) {
  store.updatePriorityHabit(id, { icon: emoji })
  emojiPickerHabitId.value = null
}

onMounted(async () => {
  await store.loadColumns()
  await store.loadCompletions(currentYear.value, currentMonth.value)
  await store.loadPriorityHabits()
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

function onClickOutside(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (!t.closest('.picker-popover') && !t.closest('.picker-trigger')) pickerOpen.value = false
  if (!t.closest('.emoji-picker') && !t.closest('.emoji-trigger')) emojiPickerHabitId.value = null
}

// --- Priority Habits ---
function onPriorityNameBlur(id: string, e: FocusEvent) {
  const el = e.target as HTMLElement
  store.updatePriorityHabit(id, { name: el.innerText.trim() || 'New habit' })
}

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value - 1, 1)
    .toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
)
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <!-- Banner -->
    <div
      class="w-full h-[220px]"
      style="background: linear-gradient(135deg, #8fadb8 0%, #a8c2cc 50%, #b5cdd4 100%)"
    />

    <!-- Titre -->
    <div class="mx-6 mt-4 mb-2">
      <div class="text-gray-700 font-bold" style="font-size: 60px; line-height: 1">✓</div>
      <h1 class="text-[2.5rem] font-bold text-gray-900 mt-1">Habit Tracker</h1>
    </div>

    <!-- Galerie inspiration -->
    <div class="mx-6 mt-4 flex gap-3 overflow-x-auto pb-2">
      <div class="shrink-0 w-40 h-[130px] rounded-lg bg-gray-100 flex items-center justify-center p-4">
        <span class="text-xs font-bold uppercase tracking-wide text-gray-500 text-center">A PRODUCTIVE DAY IS AHEAD</span>
      </div>
      <div class="shrink-0 w-40 h-[130px] rounded-lg bg-amber-100 flex items-center justify-center p-4">
        <span class="text-sm italic text-amber-800">morning ritual</span>
      </div>
      <div class="shrink-0 w-40 h-[130px] rounded-lg bg-slate-200" />
      <div class="shrink-0 w-40 h-[130px] rounded-lg bg-yellow-100 flex items-center justify-center p-4">
        <span class="text-sm font-bold uppercase text-yellow-800 text-center">LESS IS MORE</span>
      </div>
      <div class="shrink-0 w-40 h-[130px] rounded-lg bg-gray-900 flex items-center justify-center p-4">
        <span class="text-2xl font-bold text-white">5:05 AM</span>
      </div>
      <div class="shrink-0 w-40 h-[130px] rounded-lg bg-neutral-800 flex items-center justify-center p-4">
        <span class="text-sm text-white text-center">move your body</span>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="flex gap-8 mx-6 mt-6 mb-10">

      <!-- Panneau gauche : Priority Habits (indépendant) -->
      <div class="w-64 shrink-0">
        <h2 class="font-bold text-[1.1rem] text-gray-800 mb-3">Priority Habits</h2>
        <div class="flex flex-col gap-2">
          <div
            v-for="habit in store.priorityHabits"
            :key="habit.id"
            class="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-2 group"
          >
            <!-- Icône cliquable -->
            <div class="relative">
              <button
                class="emoji-trigger text-lg leading-none hover:scale-110 transition-transform cursor-pointer"
                :title="'Changer l\'icône'"
                @click.stop="toggleEmojiPicker(habit.id)"
              >{{ habit.icon }}</button>
              <!-- Emoji picker -->
              <div
                v-if="emojiPickerHabitId === habit.id"
                class="emoji-picker absolute left-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-2 w-48"
              >
                <div class="grid grid-cols-6 gap-1">
                  <button
                    v-for="emoji in EMOJIS"
                    :key="emoji"
                    class="text-lg hover:bg-gray-100 rounded p-1 transition-colors leading-none"
                    @click.stop="pickEmoji(habit.id, emoji)"
                  >{{ emoji }}</button>
                </div>
              </div>
            </div>
            <div
              contenteditable="true"
              class="flex-1 text-sm text-gray-700 outline-none focus:text-gray-900 min-w-0"
              data-placeholder="Écrivez quelque chose…"
              @blur="onPriorityNameBlur(habit.id, $event)"
            >{{ habit.name }}</div>
            <button
              class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity text-xs"
              @click="store.deletePriorityHabit(habit.id)"
            >✕</button>
          </div>
        </div>
        <button
          @click="store.addPriorityHabit()"
          class="mt-3 border border-gray-300 rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          New Habit
        </button>
        <div class="mt-6 bg-neutral-700 text-white rounded-xl p-5 w-[215px]">
          <p class="italic font-serif text-sm leading-relaxed">Little things make big things happen</p>
        </div>
      </div>

      <!-- Panneau droit : Track table -->
      <div class="flex-1 min-w-0 relative">
        <!-- Header tableau avec navigateur de mois -->
        <div class="flex items-center justify-between mb-3 relative">
          <span class="font-medium text-gray-700">Track</span>
          <button
            class="picker-trigger flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors capitalize"
            @click.stop="openPicker"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.4"/>
              <path d="M1 6h14" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5 1v2M11 1v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            {{ monthLabel }}
          </button>

          <!-- Popover mois -->
          <div
            v-if="pickerOpen"
            class="picker-popover absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-52"
          >
            <div class="flex items-center justify-between mb-3">
              <button @click="prevPickerMonth" class="p-1 rounded hover:bg-gray-100 text-gray-500">
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <span class="text-sm font-medium text-gray-700 capitalize">
                {{ new Date(pickerYear, pickerMonth - 1, 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' }) }}
              </span>
              <button @click="nextPickerMonth" class="p-1 rounded hover:bg-gray-100 text-gray-500">
                <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <button
              @click="applyPicker"
              class="w-full py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Afficher ce mois
            </button>
          </div>
        </div>

        <!-- Tableau -->
        <div class="overflow-x-auto">
          <table class="text-sm border-collapse" style="table-layout: fixed">
            <colgroup>
              <!-- Date column -->
              <col style="width: 120px" />
              <!-- Checkbox columns -->
              <col
                v-for="col in store.columns.filter(c => !c.is_text)"
                :key="col.id"
                style="width: 110px"
              />
              <!-- Name column -->
              <col
                v-if="store.columns.find(c => c.is_text)"
                style="width: 160px"
              />
              <!-- Add column -->
              <col style="width: 36px" />
            </colgroup>

            <thead>
              <tr class="bg-white">
                <!-- Date header -->
                <th class="border border-gray-200 px-3 py-2 text-left">
                  <div class="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.4"/>
                      <path d="M1 6h14" stroke="currentColor" stroke-width="1.4"/>
                      <path d="M5 1v2M11 1v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                    Date
                  </div>
                </th>

                <!-- Checkbox column headers -->
                <th
                  v-for="col in store.columns.filter(c => !c.is_text)"
                  :key="col.id"
                  class="border border-gray-200 px-3 py-2 text-left"
                >
                  <div class="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" stroke-width="1.4"/>
                      <path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <input
                      v-if="editingColId === col.id"
                      v-model="editingColName"
                      class="outline-none bg-transparent w-[80px] text-xs font-medium text-gray-700 border-b border-blue-400"
                      @blur="saveCol(col.id)"
                      @keydown="onColKeydown(col.id, $event)"
                      v-focus
                    />
                    <span
                      v-else
                      class="truncate max-w-[80px] cursor-pointer hover:text-gray-700"
                      @click="startEditCol(col.id, col.name)"
                    >{{ col.name }}</span>
                  </div>
                </th>

                <!-- Name column header -->
                <th
                  v-if="store.columns.find(c => c.is_text)"
                  :key="store.columns.find(c => c.is_text)!.id"
                  class="border border-gray-200 px-3 py-2 text-left"
                >
                  <div class="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                    </svg>
                    <input
                      v-if="editingColId === store.columns.find(c => c.is_text)!.id"
                      v-model="editingColName"
                      class="outline-none bg-transparent w-[100px] text-xs font-medium text-gray-700 border-b border-blue-400"
                      @blur="saveCol(store.columns.find(c => c.is_text)!.id)"
                      @keydown="onColKeydown(store.columns.find(c => c.is_text)!.id, $event)"
                      v-focus
                    />
                    <span
                      v-else
                      class="truncate max-w-[100px] cursor-pointer hover:text-gray-700"
                      @click="startEditCol(store.columns.find(c => c.is_text)!.id, store.columns.find(c => c.is_text)!.name)"
                    >{{ store.columns.find(c => c.is_text)!.name }}</span>
                  </div>
                </th>

                <!-- + ajouter colonne -->
                <th class="border border-gray-200 text-center">
                  <button
                    @click="store.addColumn()"
                    class="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors py-2"
                    title="Ajouter une colonne"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
                      <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="day in days"
                :key="day.dateStr"
                class="bg-white hover:bg-gray-50/60 transition-colors"
              >
                <!-- Date cell -->
                <td
                  class="border border-gray-200 px-3 h-9 whitespace-nowrap"
                  :class="day.isToday ? 'bg-blue-50' : ''"
                >
                  <div class="flex items-center gap-1.5">
                    <span
                      class="text-xs font-medium capitalize"
                      :class="day.isToday ? 'text-blue-600' : 'text-gray-500'"
                    >{{ day.short }} {{ day.num }}</span>
                    <span v-if="day.isToday" class="text-[10px] text-blue-400">today</span>
                  </div>
                </td>

                <!-- Checkbox cells -->
                <td
                  v-for="col in store.columns.filter(c => !c.is_text)"
                  :key="col.id"
                  class="border border-gray-200 h-9"
                  :class="day.isToday ? 'bg-blue-50' : ''"
                >
                  <div class="flex items-center justify-center h-full">
                    <button
                      class="notion-checkbox transition-colors"
                      :class="store.isChecked(col.id, day.dateStr) ? 'checked' : 'unchecked'"
                      @click="store.toggleCheck(col.id, day.dateStr)"
                    >
                      <svg v-if="store.isChecked(col.id, day.dateStr)" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>

                <!-- Name (text) cell -->
                <td
                  v-if="store.columns.find(c => c.is_text)"
                  :key="store.columns.find(c => c.is_text)!.id + day.dateStr"
                  class="border border-gray-200 h-9 px-3"
                  :class="day.isToday ? 'bg-blue-50' : ''"
                >
                  <div
                    contenteditable="true"
                    class="text-xs text-gray-700 outline-none w-full h-full flex items-center min-h-[36px]"
                    data-placeholder="—"
                    @blur="onTextBlur(store.columns.find(c => c.is_text)!.id, day.dateStr, $event)"
                  >{{ store.getText(store.columns.find(c => c.is_text)!.id, day.dateStr) }}</div>
                </td>

                <!-- Empty cell under "+" -->
                <td class="border border-gray-200 h-9" :class="day.isToday ? 'bg-blue-50' : ''" />
              </tr>
            </tbody>
          </table>

          <!-- Footer -->
          <div class="border-x border-b border-gray-200 px-3 py-2">
            <button
              @click="store.addColumn()"
              class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              + Nouvelle habitude
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
[contenteditable]:empty::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
}

.notion-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.notion-checkbox svg {
  width: 12px;
  height: 10px;
}

.notion-checkbox.unchecked {
  border: 1.5px solid #d1d5db;
  background: white;
}

.notion-checkbox.unchecked:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.notion-checkbox.checked {
  background: #2563eb;
  border: 1.5px solid #2563eb;
}
</style>
