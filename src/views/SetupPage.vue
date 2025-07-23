<template>
  <div class="setup-page">
    <div class="setup-container">
      <header class="setup-header">
        <h1>🎁 抽獎系統設定</h1>
        <p>設定獎項和數量，生成抽獎頁面</p>
      </header>

      <!-- 獎項設定區域 -->
      <div class="setup-section">
        <h2>獎項設定</h2>
        <div class="prize-inputs">
          <div class="input-group">
            <label for="prizeName">獎項名稱:</label>
            <input 
              id="prizeName"
              v-model="newPrize.name" 
              type="text" 
              placeholder="例如: 特獎、頭獎、二獎..."
              @keyup.enter="addPrize"
            />
          </div>
          <div class="input-group">
            <label for="prizeQuantity">數量:</label>
            <input 
              id="prizeQuantity"
              v-model.number="newPrize.quantity" 
              type="number" 
              min="1"
              placeholder="1"
              @keyup.enter="addPrize"
            />
          </div>
          <button @click="addPrize" class="add-btn">新增獎項</button>
        </div>
        
        <!-- 已設定的獎項列表 -->
        <div class="prize-list" v-if="prizes.length > 0">
          <h3>已設定的獎項:</h3>
          <div class="prize-item" v-for="(prize, index) in prizes" :key="index">
            <span class="prize-info">{{ prize.name }} ({{ prize.quantity }}個)</span>
            <button @click="removePrize(index)" class="remove-btn">刪除</button>
          </div>
          <div class="total-info">
            總計: {{ totalCards }} 張抽獎牌
          </div>
        </div>
      </div>

      <!-- 生成抽獎頁面 -->
      <div class="generate-section" v-if="prizes.length > 0">
        <h2>生成抽獎頁面</h2>
        <div class="lottery-info">
          <p>設定完成後，點擊下方按鈕生成抽獎頁面</p>
          <p>生成的 URL 可以分享給其他人進行抽獎</p>
        </div>
        <button @click="generateLottery" class="generate-btn">
          生成抽獎頁面
        </button>
      </div>

      <!-- 生成的 URL -->
      <div class="url-section" v-if="lotteryUrl">
        <h2>抽獎頁面連結</h2>
        <div class="url-display">
          <input 
            :value="lotteryUrl" 
            readonly 
            class="url-input"
            ref="urlInput"
          />
          <button @click="copyUrl" class="copy-btn">複製連結</button>
        </div>
        <div class="url-actions">
          <button @click="openLottery" class="open-btn">開啟抽獎頁面</button>
          <button @click="resetSetup" class="reset-btn">重新設定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 獎項設定
 */
const prizes = ref([])
const newPrize = reactive({
  name: '',
  quantity: 1
})

/**
 * 生成的抽獎 URL
 */
const lotteryUrl = ref('')
const urlInput = ref(null)

/**
 * 計算總抽獎牌數量
 */
const totalCards = computed(() => {
  return prizes.value.reduce((total, prize) => total + prize.quantity, 0)
})

/**
 * 新增獎項
 */
const addPrize = () => {
  if (!newPrize.name.trim() || newPrize.quantity < 1) {
    alert('請輸入有效的獎項名稱和數量')
    return
  }
  
  prizes.value.push({
    name: newPrize.name.trim(),
    quantity: newPrize.quantity
  })
  
  // 清空輸入
  newPrize.name = ''
  newPrize.quantity = 1
}

/**
 * 移除獎項
 */
const removePrize = (index) => {
  prizes.value.splice(index, 1)
}

/**
 * 生成抽獎頁面
 */
const generateLottery = () => {
  if (prizes.value.length === 0) {
    alert('請至少設定一個獎項')
    return
  }

  // 生成唯一的抽獎 ID
  const lotteryId = generateLotteryId()
  
  // 將獎項資料儲存到 localStorage
  const lotteryData = {
    id: lotteryId,
    prizes: prizes.value,
    totalCards: totalCards.value,
    createdAt: new Date().toISOString()
  }
  
  localStorage.setItem(`lottery_${lotteryId}`, JSON.stringify(lotteryData))
  
  // 生成 URL
  lotteryUrl.value = `${window.location.origin}/ichibankuji/lottery/${lotteryId}`
}

/**
 * 生成唯一的抽獎 ID (50位數)
 */
const generateLotteryId = async () => {
  // 使用時間戳 + 隨機數生成 50 位數 ID
  const timestamp = Date.now().toString(36).padStart(10, '0')
  
  // 生成 40 位隨機字符
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let randomPart = ''
  
  // 使用多個隨機源確保唯一性
  for (let i = 0; i < 40; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    randomPart += chars[randomIndex]
  }
  
  // 組合：10位時間戳 + 40位隨機字符 = 50位
  return timestamp + randomPart
}

/**
 * 生成更安全的抽獎 ID (50位數) - 使用 Web Crypto API
 */
const generateSecureLotteryId = async () => {
  try {
    // 使用 Web Crypto API 生成更安全的隨機數
    const array = new Uint8Array(25) // 25 bytes = 50 characters (base36)
    crypto.getRandomValues(array)
    
    // 轉換為 base36 字符串
    let result = ''
    for (let i = 0; i < array.length; i++) {
      result += array[i].toString(36).padStart(2, '0')
    }
    
    // 確保長度為 50 位
    return result.substring(0, 50).padEnd(50, '0')
  } catch (error) {
    // 降級到標準方法
    console.warn('Web Crypto API 不可用，使用標準隨機數生成')
    return generateLotteryId()
  }
}

/**
 * 複製 URL
 */
const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(lotteryUrl.value)
    alert('連結已複製到剪貼簿')
  } catch (err) {
    // 降級方案
    urlInput.value.select()
    document.execCommand('copy')
    alert('連結已複製到剪貼簿')
  }
}

/**
 * 開啟抽獎頁面
 */
const openLottery = () => {
  window.open(lotteryUrl.value, '_blank')
}

/**
 * 重新設定
 */
const resetSetup = () => {
  if (confirm('確定要重新設定嗎？這將清除所有已設定的獎項。')) {
    prizes.value = []
    lotteryUrl.value = ''
    newPrize.name = ''
    newPrize.quantity = 1
  }
}
</script>

<style scoped>
.setup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.setup-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.setup-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 40px 20px;
}

.setup-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.setup-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.setup-section,
.generate-section,
.url-section {
  padding: 30px;
  border-bottom: 1px solid #e9ecef;
}

.setup-section:last-child,
.generate-section:last-child,
.url-section:last-child {
  border-bottom: none;
}

h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

h3 {
  color: #34495e;
  margin-bottom: 16px;
  font-size: 1.2rem;
}

.prize-inputs {
  display: flex;
  gap: 16px;
  align-items: end;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 150px;
}

.input-group label {
  font-weight: 600;
  color: #495057;
}

.input-group input {
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

.add-btn,
.generate-btn,
.copy-btn,
.open-btn,
.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.add-btn {
  background: #28a745;
  color: white;
}

.add-btn:hover {
  background: #218838;
}

.generate-btn {
  background: #667eea;
  color: white;
  font-size: 16px;
  padding: 16px 32px;
}

.generate-btn:hover {
  background: #5a6fd8;
}

.prize-list {
  margin-top: 20px;
}

.prize-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.prize-info {
  font-weight: 500;
  color: #495057;
}

.remove-btn {
  background: #dc3545;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #c82333;
}

.total-info {
  background: #e3f2fd;
  color: #1976d2;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin-top: 16px;
}

.lottery-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.lottery-info p {
  margin: 8px 0;
  color: #6c757d;
}

.url-display {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.url-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: #f8f9fa;
  color: #495057;
}

.copy-btn {
  background: #17a2b8;
  color: white;
  white-space: nowrap;
}

.copy-btn:hover {
  background: #138496;
}

.url-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.open-btn {
  background: #28a745;
  color: white;
}

.open-btn:hover {
  background: #218838;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .setup-page {
    padding: 10px;
  }
  
  .prize-inputs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .url-display {
    flex-direction: column;
  }
  
  .url-actions {
    flex-direction: column;
  }
}

@media (min-width: 1920px) {
  .setup-container {
    max-width: 1400px;
  }
  
  .setup-header h1 {
    font-size: 3rem;
  }
  
  .setup-header p {
    font-size: 1.2rem;
  }
  
  .prize-inputs {
    gap: 24px;
  }
  
  .input-group input {
    padding: 16px;
    font-size: 16px;
  }
  
  .add-btn,
  .generate-btn,
  .copy-btn,
  .open-btn,
  .reset-btn {
    padding: 16px 32px;
    font-size: 16px;
  }
}
</style> 