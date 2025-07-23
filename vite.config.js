// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 替換 `your-repo-name` 為你 GitHub 上的 repository 名稱
export default defineConfig({
  plugins: [vue()],
  base: '/ichibankuji/', 
})
