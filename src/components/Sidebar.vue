<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const collapsed = ref(false)

const sections = [
  {
    title: 'Daily',
    items: [
      { icon: '📎', label: 'My Planner', route: '/planner' },
      { icon: '✔️', label: 'Habit Tracker', route: null },
      { icon: '🎯', label: 'Journal', route: null },
    ],
  },
  {
    title: 'Goals',
    items: [
      { icon: '✨', label: 'Goals & Vision Boards', route: null },
      { icon: '🫧', label: 'Routines', route: null },
      { icon: '📄', label: 'Note to Self', route: null },
    ],
  },
  {
    title: 'Wellness',
    items: [
      { icon: '🎧', label: 'Workouts', route: null },
      { icon: '🥑', label: 'Meals & Groceries', route: null },
      { icon: '🍪', label: 'My Recipes', route: null },
    ],
  },
  {
    title: 'Personal',
    items: [
      { icon: '📖', label: 'Book', route: null },
      { icon: '🎬', label: 'TV/Movies', route: null },
      { icon: '✈️', label: 'Travel Plans', route: null },
    ],
  },
]

const open = ref<Record<string, boolean>>(
  Object.fromEntries(sections.map((s) => [s.title, true]))
)

function toggle(title: string) {
  open.value[title] = !open.value[title]
}

function navigate(route: string | null) {
  if (route) router.push(route)
}
</script>

<template>
  <aside
    class="relative shrink-0 border-l border-gray-200 transition-all duration-300 overflow-visible"
    :class="collapsed ? 'w-0' : 'w-56'"
  >
    <!-- Handle tab on left edge -->
    <button
      @click="collapsed = !collapsed"
      class="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 z-10 flex flex-col gap-1 items-center justify-center w-4 h-12 rounded-l-md bg-white border border-r-0 border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
      :title="collapsed ? 'Ouvrir' : 'Réduire'"
    >
      <span class="block w-0.5 h-3 bg-gray-300 rounded-full" />
      <span class="block w-0.5 h-3 bg-gray-300 rounded-full" />
    </button>

    <!-- Sidebar content -->
    <div
      class="h-full overflow-y-auto transition-opacity duration-200"
      :class="collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'"
    >
      <nav class="py-4">
        <div v-for="section in sections" :key="section.title" class="mb-2">
          <button
            @click="toggle(section.title)"
            class="w-full flex items-center justify-between px-4 py-2 group"
          >
            <span class="text-xs font-bold tracking-widest uppercase text-gray-400 group-hover:text-gray-600 transition-colors">
              {{ section.title }}
            </span>
            <span
              class="text-gray-300 group-hover:text-gray-400 transition-all duration-200 text-xs"
              :class="open[section.title] ? 'opacity-100' : 'opacity-50'"
            >
              {{ open[section.title] ? '−' : '+' }}
            </span>
          </button>

          <div v-if="open[section.title]" class="mt-0.5 mb-2">
            <button
              v-for="item in section.items"
              :key="item.label"
              @click="navigate(item.route)"
              class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              :class="item.route ? 'cursor-pointer' : 'cursor-default opacity-50'"
            >
              <span class="text-base leading-none">{{ item.icon }}</span>
              <span class="truncate">{{ item.label }}</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  </aside>
</template>
