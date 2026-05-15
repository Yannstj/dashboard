<script setup lang="ts">
import { ref } from 'vue'
import coloredSekai from '../assets/images/colored_sekai.jpeg'

const gratitude = ref('')
const affirmation = ref('')

const morningHabits = ref([{ id: 1, label: 'Tâche', done: false }])
const eveningHabits = ref([{ id: 1, label: 'Tâche', done: false }])

const meals = ref({ breakfast: '', lunch: '', dinner: '', snacks: '' })

let nextId = 2

function addMorningHabit() {
  morningHabits.value.push({ id: nextId++, label: 'Tâche', done: false })
}

function addEveningHabit() {
  eveningHabits.value.push({ id: nextId++, label: 'Tâche', done: false })
}
</script>

<template>
  <section class="border border-gray-200 rounded-lg overflow-hidden mt-6 mx-6">
    <!-- Header -->
    <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
      <h2 class="text-lg font-bold">Daily Check-In</h2>
    </div>

    <!-- Content -->
    <div class="flex gap-8 p-5 items-start">
      <!-- Image -->
      <div class="shrink-0 w-40 h-52 rounded overflow-hidden">
        <img :src="coloredSekai" alt="daily" class="w-full h-full object-cover object-top" />
      </div>

      <!-- Daily Gratitude + Affirmation -->
      <div class="flex flex-col gap-4 min-w-[200px]">
        <div>
          <h3 class="font-semibold mb-2">Daily Gratitude</h3>
          <div class="border border-gray-300 rounded-lg px-3 py-2 flex items-start gap-2">
            <span>🔥</span>
            <textarea
              v-model="gratitude"
              placeholder="Écrivez quelque chose..."
              rows="2"
              class="w-full resize-none text-sm outline-none bg-transparent"
            />
          </div>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Daily Affirmation</h3>
          <div class="border border-gray-300 rounded-lg px-3 py-2 flex items-start gap-2">
            <span>💬</span>
            <textarea
              v-model="affirmation"
              placeholder="Écrivez quelque chose..."
              rows="2"
              class="w-full resize-none text-sm outline-none bg-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Morning Routine -->
      <div class="min-w-[180px]">
        <h3 class="font-semibold mb-2">Morning Routine Checklist</h3>
        <ul class="flex flex-col gap-1 mb-3">
          <li
            v-for="habit in morningHabits"
            :key="habit.id"
            class="flex items-center gap-2 text-sm"
          >
            <input type="checkbox" v-model="habit.done" class="w-4 h-4" />
            <span :class="{ 'line-through text-gray-400': habit.done }">{{ habit.label }}</span>
          </li>
        </ul>
        <button
          @click="addMorningHabit"
          class="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
        >
          New Habit
        </button>
      </div>

      <!-- Evening Routine -->
      <div class="min-w-[180px]">
        <h3 class="font-semibold mb-2">Evening Routine Checklist</h3>
        <ul class="flex flex-col gap-1 mb-3">
          <li
            v-for="habit in eveningHabits"
            :key="habit.id"
            class="flex items-center gap-2 text-sm"
          >
            <input type="checkbox" v-model="habit.done" class="w-4 h-4" />
            <span :class="{ 'line-through text-gray-400': habit.done }">{{ habit.label }}</span>
          </li>
        </ul>
        <button
          @click="addEveningHabit"
          class="text-sm border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
        >
          New Habit
        </button>
      </div>

      <!-- Meals -->
      <div class="flex-1 min-w-[200px]">
        <h3 class="font-semibold mb-2 text-center">Meals</h3>
        <table class="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <tbody>
            <tr
              v-for="(key, label) in {
                Breakfast: 'breakfast',
                Lunch: 'lunch',
                Dinner: 'dinner',
                Snacks: 'snacks',
              }"
              :key="key"
              class="border-b border-gray-200 last:border-0"
            >
              <td class="px-3 py-2 font-medium w-24 border-r border-gray-200">{{ label }}</td>
              <td class="px-3 py-1">
                <input
                  v-model="meals[key]"
                  type="text"
                  class="w-full text-sm outline-none bg-transparent"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
