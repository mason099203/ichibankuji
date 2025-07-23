<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="error-content">
        <h1>404</h1>
        <h2>頁面找不到</h2>
        <p>抱歉，您要尋找的頁面不存在。</p>
        <div class="actions">
          <button @click="goHome" class="home-btn">回到首頁</button>
          <button @click="goBack" class="back-btn">返回上一頁</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 回到首頁
 */
const goHome = () => {
  router.push('/')
}

/**
 * 返回上一頁
 */
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 80px 60px;
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.error-content h1 {
  font-size: 6rem;
  color: #667eea;
  margin: 0;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-content h2 {
  font-size: 2rem;
  color: #2c3e50;
  margin: 20px 0;
}

.error-content p {
  color: #6c757d;
  font-size: 1.1rem;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.home-btn,
.back-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.home-btn {
  background: #667eea;
  color: white;
}

.home-btn:hover {
  background: #5a6fd8;
}

.back-btn {
  background: #6c757d;
  color: white;
}

.back-btn:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 40px 20px;
  }
  
  .error-content h1 {
    font-size: 4rem;
  }
  
  .error-content h2 {
    font-size: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
  }
}

@media (min-width: 1920px) {
  .not-found-container {
    max-width: 700px;
    padding: 100px 80px;
  }
  
  .error-content h1 {
    font-size: 8rem;
  }
  
  .error-content h2 {
    font-size: 2.5rem;
  }
  
  .error-content p {
    font-size: 1.3rem;
  }
  
  .home-btn,
  .back-btn {
    padding: 16px 32px;
    font-size: 16px;
  }
}
</style> 