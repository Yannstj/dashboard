<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '../utils/supabase'
import banner from '../assets/images/chill_ambiant.jpg'

const tasks = ref([])

async function getTasks() {
  const { data } = await supabase.from('tasks').select()
  tasks.value = data ?? []
}

onMounted(() => {
  getTasks()
})
</script>

<template>
  <div class="relative w-full overflow-hidden h-[min(380px,45vw)]">
    <img :src="banner" alt="banner" class="w-full h-full object-cover object-[center_80%]" />
  </div>
  <ul>
    <li v-for="task in tasks" :key="task.id">{{ task.name }}</li>
  </ul>
</template>
