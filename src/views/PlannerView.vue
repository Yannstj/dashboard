<script setup lang="ts">
import banner from '../assets/images/chill_ambiant.jpg'
import MonthlyOverview from '../components/MonthlyOverview.vue'
import PlannerClock from '../components/PlannerClock.vue'
import WeeklyPlanner from '../components/WeeklyPlanner.vue'
</script>

<template>
  <div class="flex-1 overflow-y-auto">
      <!-- Banner -->
      <div class="relative w-full overflow-hidden h-[min(300px,40vw)]">
        <img :src="banner" alt="banner" class="w-full h-full object-cover object-[center_80%]" />
        <div class="absolute inset-0 bg-black/20 flex flex-col justify-end px-10 pb-8">
          <h1 class="text-white text-5xl font-bold drop-shadow-lg">My Planner</h1>
        </div>
      </div>

      <!-- Clock + Spotify row -->
      <div class="flex items-stretch gap-6 mx-6 mt-8 mb-8">
        <!-- Clock -->
        <div class="flex items-center justify-center py-4">
          <PlannerClock />
        </div>
      </div>

      <hr class="mx-6 mb-6 border-gray-200" />

      <!-- Weekly Planner -->
      <WeeklyPlanner />

      <hr class="mx-6 mb-6 border-gray-200" />

      <!-- Calendar -->
      <MonthlyOverview />
      <div class="h-8" />
  </div>
</template>
