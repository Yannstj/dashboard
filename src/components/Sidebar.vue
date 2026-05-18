<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const collapsed = ref(false)
const hoverExpanded = ref(false)

const isOpen = computed(() => !collapsed.value || hoverExpanded.value)

function toggleCollapse() {
  collapsed.value = !collapsed.value
  hoverExpanded.value = false
}

function onEdgeEnter() {
  if (collapsed.value) hoverExpanded.value = true
}

function onSidebarLeave() {
  if (collapsed.value) hoverExpanded.value = false
}

const sections = [
  {
    title: 'Daily',
    items: [
      { icon: '📎', label: 'My Planner', route: '/planner' },
      { icon: '✔️', label: 'Habit Tracker', route: '/habits' },
      { icon: '🎯', label: 'Journal', route: '/journal' },
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

function navigate(r: string | null) {
  if (r) router.push(r)
}

function isActive(r: string | null) {
  return r && route.path === r
}
</script>

<template>
  <!-- Edge hover trigger (actif uniquement quand sidebar repliée) -->
  <div
    class="fixed right-0 top-0 h-full z-30 transition-all duration-200"
    :class="collapsed && !hoverExpanded ? 'w-3 cursor-pointer' : 'w-0 pointer-events-none'"
    @mouseenter="onEdgeEnter"
  />

  <aside
    class="relative shrink-0 border-l border-gray-200 transition-all duration-300 overflow-visible"
    :class="isOpen ? 'w-56' : 'w-0'"
    @mouseleave="onSidebarLeave"
  >
    <!-- Handle -->
    <button
      @click="toggleCollapse"
      class="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 z-10 flex flex-col gap-1 items-center justify-center w-4 h-12 rounded-l-md bg-white border border-r-0 border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
      :title="collapsed ? 'Ouvrir' : 'Réduire'"
    >
      <span class="block w-0.5 h-3 bg-gray-300 rounded-full" />
      <span class="block w-0.5 h-3 bg-gray-300 rounded-full" />
    </button>

    <!-- Contenu -->
    <div
      class="h-full overflow-y-auto transition-opacity duration-200 flex flex-col"
      :class="isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <!-- Bouton Home -->
      <div class="px-3 pt-4 pb-2">
        <button
          @click="navigate('/')"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isActive('/') ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="shrink-0">
            <path d="M2 6.5L8 2l6 4.5V14H10.5v-3.5h-5V14H2V6.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/>
          </svg>
          <span>Home</span>
        </button>
      </div>

      <hr class="mx-3 border-gray-100" />

      <nav class="py-3 flex-1">
        <div v-for="section in sections" :key="section.title" class="mb-2">
          <button
            @click="toggle(section.title)"
            class="w-full flex items-center justify-between px-4 py-2 group"
          >
            <span class="text-xs font-bold tracking-widest uppercase text-gray-400 group-hover:text-gray-600 transition-colors">
              {{ section.title }}
            </span>
            <span class="text-gray-300 group-hover:text-gray-400 transition-all duration-200 text-xs">
              {{ open[section.title] ? '−' : '+' }}
            </span>
          </button>

          <div v-if="open[section.title]" class="mt-0.5 mb-2">
            <button
              v-for="item in section.items"
              :key="item.label"
              @click="navigate(item.route)"
              class="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
              :class="[
                isActive(item.route)
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                item.route ? 'cursor-pointer' : 'cursor-default opacity-40',
              ]"
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
