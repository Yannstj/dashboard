<script setup lang="ts">
import { onMounted } from 'vue'
import { usePlannerStore, type DayKey } from '../stores/planner'

const store = usePlannerStore()

onMounted(async () => {
  await Promise.all([store.loadMasterTodos(), store.loadWeek()])
})

const days: { key: DayKey; label: string }[] = [
  { key: 'lundi', label: 'Lundi' },
  { key: 'mardi', label: 'Mardi' },
  { key: 'mercredi', label: 'Mercredi' },
  { key: 'jeudi', label: 'Jeudi' },
  { key: 'vendredi', label: 'Vendredi' },
  { key: 'weekend', label: 'Week-end' },
]

const EMOJIS = ['✨', '🏋️', '📖', '🎮', '🎵', '🎯', '🍃', '❤️', '🚀', '💡', '🌿', '🔥']
</script>

<template>
  <div class="mx-6 mb-6">
    <!-- Grid: master todo spans 2 rows, days fill 3 cols per row -->
    <div class="grid gap-4" style="grid-template-columns: 200px repeat(3, 1fr); grid-template-rows: auto auto;">

      <!-- Master To Do (spans 2 rows) -->
      <div class="bg-gray-50 rounded-xl p-4 border border-gray-200" style="grid-row: 1 / span 2;">
        <h3 class="font-bold text-base mb-3">Master To Do List :</h3>
        <ul class="flex flex-col gap-2 mb-3">
          <li
            v-for="todo in store.masterTodos"
            :key="todo.id"
            class="flex items-center gap-2 group"
          >
            <input
              type="checkbox"
              :checked="todo.done"
              @change="store.updateMasterTodo(todo.id, { done: !todo.done })"
              class="w-4 h-4 shrink-0 rounded"
            />
            <input
              :value="todo.label"
              @blur="store.updateMasterTodo(todo.id, { label: ($event.target as HTMLInputElement).value })"
              type="text"
              class="flex-1 text-sm outline-none bg-transparent"
              :class="{ 'line-through text-gray-400': todo.done }"
            />
            <button
              @click="store.deleteMasterTodo(todo.id)"
              class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs"
            >×</button>
          </li>
        </ul>
        <button
          @click="store.addMasterTodo"
          class="text-sm border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-100 transition-colors w-full"
        >
          + Add Task
        </button>
      </div>

      <!-- Day columns (3 per row × 2 rows = 6 days) -->
      <div
        v-for="day in days"
        :key="day.key"
        class="bg-white rounded-xl p-4 border border-gray-200 flex flex-col gap-3"
      >
        <h3 class="font-bold text-base">{{ day.label }}</h3>

        <!-- Highlights -->
        <div class="flex flex-col gap-2">
          <div
            v-for="highlight in store.weekData[day.key].highlights"
            :key="highlight.id"
            class="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 group"
          >
            <!-- Emoji picker (cycle on click) -->
            <button
              @click="highlight.emoji = EMOJIS[(EMOJIS.indexOf(highlight.emoji) + 1) % EMOJIS.length] ?? '✨'"
              class="text-base shrink-0 hover:scale-110 transition-transform"
              title="Changer l'emoji"
            >{{ highlight.emoji }}</button>
            <input
              v-model="highlight.text"
              type="text"
              placeholder="Écrivez quelque chose..."
              class="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-300"
            />
            <button
              @click="store.removeHighlight(day.key, highlight.id)"
              class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs shrink-0"
            >×</button>
          </div>
          <button
            v-if="store.weekData[day.key].highlights.length < 3"
            @click="store.addHighlight(day.key)"
            class="text-xs text-gray-300 hover:text-gray-500 text-left pl-1 transition-colors"
          >+ Ajouter un highlight</button>
        </div>

        <!-- Divider if both sections have content -->
        <div
          v-if="store.weekData[day.key].highlights.length && store.weekData[day.key].tasks.length"
          class="border-t border-gray-100"
        />

        <!-- Tasks -->
        <div class="flex flex-col gap-1.5">
          <label
            v-for="task in store.weekData[day.key].tasks"
            :key="task.id"
            class="flex items-center gap-2 text-sm group"
          >
            <input type="checkbox" v-model="task.done" class="w-4 h-4 shrink-0 rounded" />
            <input
              v-model="task.label"
              type="text"
              class="flex-1 outline-none bg-transparent text-sm"
              :class="{ 'line-through text-gray-400': task.done }"
            />
            <button
              @click="store.removeTask(day.key, task.id)"
              class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xs shrink-0"
            >×</button>
          </label>
        </div>

        <!-- Add task -->
        <button
          @click="store.addTask(day.key)"
          class="text-sm border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 transition-colors mt-auto"
        >
          Add Task
        </button>
      </div>

    </div>
  </div>
</template>
