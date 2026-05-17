<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const hours = ref('00')
const minutes = ref('00')
const period = ref('AM')

function tick() {
  const now = new Date()
  let h = now.getHours()
  period.value = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  hours.value = String(h).padStart(2, '0')
  minutes.value = String(now.getMinutes()).padStart(2, '0')
}

let timer: ReturnType<typeof setInterval>
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="flex items-center gap-1">
    <div class="flex gap-1">
      <span class="inline-flex items-center justify-center w-12 h-14 bg-gray-900 text-white text-3xl font-bold rounded-md tabular-nums">
        {{ hours[0] }}
      </span>
      <span class="inline-flex items-center justify-center w-12 h-14 bg-gray-900 text-white text-3xl font-bold rounded-md tabular-nums">
        {{ hours[1] }}
      </span>
    </div>
    <span class="text-3xl font-bold text-gray-700 mb-1">:</span>
    <div class="flex gap-1">
      <span class="inline-flex items-center justify-center w-12 h-14 bg-gray-900 text-white text-3xl font-bold rounded-md tabular-nums">
        {{ minutes[0] }}
      </span>
      <span class="inline-flex items-center justify-center w-12 h-14 bg-gray-900 text-white text-3xl font-bold rounded-md tabular-nums">
        {{ minutes[1] }}
      </span>
    </div>
    <span class="ml-1 text-sm font-bold text-gray-500 self-end mb-2">{{ period }}</span>
  </div>
</template>
