<script setup lang="ts">
import { ref, computed } from 'vue'
import banner from '../assets/images/chill_ambiant.jpg'
import sekai from '../assets/images/colored_sekai.jpeg'

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const monthNames = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
const dayNames = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']

const monthLabel = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`)

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, current: false, date: new Date(year, month - 1, daysInPrevMonth - i) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, current: true, date: new Date(year, month, d) })
  }
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ day: d, current: false, date: new Date(year, month + 1, d) })
  }

  return days
})

function isToday(date: Date) {
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}

function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}

function goToToday() {
  currentMonth.value = today.getMonth()
  currentYear.value = today.getFullYear()
}

const garland = [
  { type: 'image', src: banner },
  { type: 'quote', bg: '#dce8f5', text: 'LIFE IS BEAUTIFUL AND I HAVE TIME', color: '#5b8fc9', serif: false },
  { type: 'gradient' },
  { type: 'quote', bg: '#f0ebe3', text: 'Romanticize your life', color: '#3d3d2f', serif: true },
  { type: 'image', src: sekai },
  { type: 'quote', bg: '#dde8c4', text: 'LESS IS MORE', color: '#4a5a30', serif: false },
]
</script>

<template>
  <section class="flex mt-6 mx-6 border border-gray-200 rounded-lg overflow-hidden">

    <!-- Garland -->
    <div class="w-52 shrink-0 border-r border-gray-200 overflow-y-auto max-h-[680px]">
      <div v-for="(item, i) in garland" :key="i" class="h-52 overflow-hidden relative">

        <img v-if="item.type === 'image'" :src="item.src" class="w-full h-full object-cover" />

        <div
          v-else-if="item.type === 'quote'"
          class="w-full h-full flex items-center justify-center p-6 text-center"
          :style="{ backgroundColor: item.bg }"
        >
          <span
            class="text-sm leading-snug font-semibold tracking-wide"
            :class="item.serif ? 'font-serif' : ''"
            :style="{ color: item.color, fontFamily: item.serif ? 'Georgia, serif' : undefined }"
          >
            {{ item.text }}
          </span>
        </div>

        <div
          v-else-if="item.type === 'gradient'"
          class="w-full h-full flex items-center justify-center"
          style="background-color: #fdf0ec;"
        >
          <div class="w-28 h-28 rounded-full" style="background: radial-gradient(circle, #e8a090 0%, #f5c8b8 40%, transparent 70%); opacity: 0.85;" />
        </div>

      </div>
    </div>

    <!-- Calendar -->
    <div class="flex-1 flex flex-col">

      <!-- Calendar header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-bold">Monthly Overview</h2>
        <div class="flex items-center gap-3">
          <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="text-sm font-medium capitalize">{{ monthLabel }}</span>
          <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button @click="goToToday" class="ml-2 text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
            Aujourd'hui
          </button>
        </div>
      </div>

      <!-- Day headers -->
      <div class="grid grid-cols-7 border-b border-gray-200">
        <div
          v-for="day in dayNames"
          :key="day"
          class="py-2 text-center text-xs text-gray-400 font-medium"
        >
          {{ day }}
        </div>
      </div>

      <!-- Days grid -->
      <div class="grid grid-cols-7 flex-1">
        <div
          v-for="(cell, i) in calendarDays"
          :key="i"
          class="border-b border-r border-gray-100 min-h-[90px] p-2"
          :class="{ 'text-gray-300': !cell.current }"
        >
          <span
            class="inline-flex items-center justify-center w-7 h-7 text-sm"
            :class="isToday(cell.date) ? 'bg-red-500 text-white rounded-full font-semibold' : ''"
          >
            {{ cell.day }}
          </span>
        </div>
      </div>

    </div>
  </section>
</template>
