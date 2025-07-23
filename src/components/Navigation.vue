<template>
  <nav class="navigation">
    <div class="nav-container">
      <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
        設定頁面
      </router-link>
      <div class="nav-divider"></div>

    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

</script>

<style scoped>
.navigation {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 100vw;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: #495057;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
  background: transparent;
}

.nav-link:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-link.active {
  background: #667eea;
  color: white;
}

.nav-divider {
  width: 1px;
  height: 24px;
  background: #dee2e6;
}

.nav-info {
  color: #6c757d;
  font-size: 0.9rem;
  margin-left: auto;
}

@media (max-width: 768px) {
  .nav-container {
    padding: 8px 15px;
    gap: 12px;
  }
  
  .nav-info {
    display: none;
  }
}

@media (min-width: 1920px) {
  .nav-container {
    max-width: 1920px;
    padding: 20px 40px;
    gap: 30px;
  }
  
  .nav-link {
    padding: 12px 24px;
    font-size: 16px;
  }
  
  .nav-info {
    font-size: 1rem;
  }
}
</style> 