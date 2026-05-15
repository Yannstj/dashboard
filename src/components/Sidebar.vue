<script setup lang="ts">
import { ref } from 'vue'

const collapsed = ref(false)

const sections = [
  {
    title: 'Daily',
    items: [
      { icon: '📎', label: 'My Planner' },
      { icon: '✔️', label: 'Habit Tracker' },
      { icon: '🎯', label: 'Journal' },
    ],
  },
  {
    title: 'Goals',
    items: [
      { icon: '✨', label: 'Goals & Vision Boards' },
      { icon: '🫧', label: 'Routines' },
      { icon: '📄', label: 'Note to Self' },
    ],
  },
  {
    title: 'Wellness',
    items: [
      { icon: '🎧', label: 'Workouts' },
      { icon: '🥑', label: 'Meals & Groceries' },
      { icon: '🍪', label: 'My Recipes' },
    ],
  },
  {
    title: 'Personal',
    items: [
      { icon: '📖', label: 'Book' },
      { icon: '🎬', label: 'TV/Movies' },
      { icon: '✈️', label: 'Travel Plans' },
    ],
  },
]

const open = ref<Record<string, boolean>>(
  Object.fromEntries(sections.map((s) => [s.title, true]))
)

function toggle(title: string) {
  open.value[title] = !open.value[title]
}
</script>

<template>
  <aside
    class="shrink-0 border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col"
    :class="collapsed ? 'w-12' : 'w-56'"
  >
    <!-- Toggle button -->
    <div class="flex items-center justify-end px-2 py-3 border-b border-gray-200">
      <button
        @click="collapsed = !collapsed"
        class="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500"
        :title="collapsed ? 'Ouvrir' : 'Réduire'"
      >
        <svg class="w-4 h-4 transition-transform duration-300" :class="collapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Sections -->
    <nav class="flex-1 overflow-y-auto py-2">
      <div v-for="section in sections" :key="section.title" class="mb-1">

        <!-- Section header -->
        <button
          @click="toggle(section.title)"
          class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors"
        >
          <svg
            class="w-3 h-3 text-gray-400 shrink-0 transition-transform duration-200"
            :class="open[section.title] ? 'rotate-90' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span v-if="!collapsed" class="text-sm font-bold truncate">{{ section.title }}</span>
        </button>

        <!-- Sub-items -->
        <div v-if="!collapsed && open[section.title]" class="ml-2">
          <button
            v-for="item in section.items"
            :key="item.label"
            class="w-full flex items-center gap-2 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors rounded"
          >
            <span class="text-base leading-none">{{ item.icon }}</span>
            <span class="truncate">{{ item.label }}</span>
          </button>
        </div>

      </div>
    </nav>
  </aside>
</template>
