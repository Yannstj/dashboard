<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../utils/supabase'
import banner from '../assets/images/chill_ambiant.jpg'
import DailyCheckIn from '../components/DailyCheckIn.vue'
import MonthlyOverview from '../components/MonthlyOverview.vue'

const tasks = ref<Record<string, unknown>[]>([])

async function getTasks() {
  const { data } = await supabase.from('tasks').select()
  tasks.value = data ?? []
}

onMounted(() => {
  getTasks()
})
</script>

<template>
  <div class="flex-1 overflow-y-auto">
    <!-- Header banner -->
    <div class="relative w-full overflow-hidden h-[min(380px,45vw)]">
      <img :src="banner" alt="banner" class="w-full h-full object-cover object-[center_80%]" />
      <div class="absolute inset-0 flex items-center px-10">
        <h1 class="text-white text-4xl font-bold drop-shadow-lg">Daily Dashboard</h1>
      </div>
    </div>

    <DailyCheckIn />
    <hr class="mx-6 my-8 border-gray-200" />
    <MonthlyOverview />
  </div>
</template>
