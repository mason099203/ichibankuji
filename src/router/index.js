import { createRouter, createWebHistory } from 'vue-router'
import SetupPage from '../views/SetupPage.vue'
import LotteryPage from '../views/LotteryPage.vue'
import NotFound from '../views/NotFound.vue'

/**
 * 路由配置
 */
const routes = [
  {
    path: '/',
    name: 'Setup',
    component: SetupPage
  },
  {
    path: '/lottery',
    name: 'Lottery',
    component: LotteryPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

/**
 * 建立路由實例
 */
const router = createRouter({
  history: createWebHistory('/ichibankuji/'),
  routes
})

export default router 