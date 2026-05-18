import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/planner',
      component: () => import('../views/PlannerView.vue'),
    },
    {
      path: '/habits',
      component: () => import('../views/HabitTrackerView.vue'),
    },
  ],
})

export default router
