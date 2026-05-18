<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen">
    <div class="flex-1 overflow-y-auto min-w-0">
      <RouterView />
    </div>
    <Sidebar />
  </div>
</template>
