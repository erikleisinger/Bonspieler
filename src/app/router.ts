import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import { PoolManager } from '@/widgets/PoolManager'
import { BonspielEditor } from '@/pages/BonspielEditor'
import { BracketEditor } from '@/widgets/BracketManager'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
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
    },
    {
      path: '/editoronly',
      name: 'editoronly',
      component: BracketEditor,
    }
  ],
})

export default router
