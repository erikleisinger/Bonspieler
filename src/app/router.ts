import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import { PoolManager } from '@/widgets/PoolManager'
import BracketManager from '@/widgets/Bracket2/BracketManager.vue'
import { BonspielEditor } from '@/pages/BonspielEditor'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/test',
      name: 'test',
      component: BracketManager,
    },
    {
      path: '/pool',
      name: 'pool',
      component: PoolManager,
    },
    {
      path: '/editor',
      name: 'editor',
      component: BonspielEditor,
    }
  ],
})

export default router
