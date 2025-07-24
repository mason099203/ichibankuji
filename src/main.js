import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

/**
 * 建立 Vue 應用實例
 */
const app = createApp(App)

/**
 * 使用路由
 */
app.use(router)

/**
 * 處理 404.html 的重導向
 */
const redirectPath = sessionStorage.redirect
if (redirectPath) {
  sessionStorage.removeItem('redirect')
  router.replace(redirectPath)
}

/**
 * 掛載應用
 */
app.mount('#app')
