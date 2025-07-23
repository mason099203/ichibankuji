<template>
    <div class="lottery-container">

      <!-- 錯誤訊息 -->
      <div v-if="error" class="error-message">
        <h2>❌ 錯誤</h2>
        <p>{{ error }}</p>
        <button @click="goToSetup" class="setup-btn">回到設定頁面</button>
      </div>

      <!-- 抽獎內容 -->
      <div v-else-if="lotteryData" class="lottery-content">
        <!-- 抽獎標題 -->
        <div class="lottery-header" v-if="lotteryData.title">
          <h1 class="lottery-title">{{ lotteryData.title }}</h1>
        </div>

        <!-- 主要抽獎區域 -->
        <div class="main-lottery-area">
          <!-- 左側：抽獎牌網格 -->
          <div class="cards-section">
            <h2>🎯 抽獎牌 ({{ remainingCards }} 張剩餘) 
            </h2>
            <div class="cards-grid" :class="gridSizeClass">
              <div 
                v-for="(card, index) in cards" 
                :key="index"
                class="card"
                :class="{ 
                  'drawn': card.isDrawn,
                  'selected': selectedCardIndex === index && !card.isDrawn
                }"
                @click="selectCard(index)"
              >
                <div class="card-number">{{ card.number }}</div>
                <div v-if="card.isDrawn" class="card-drawn-text">已抽</div>
              </div>
            </div>
          </div>

          <!-- 右側：獎項資訊 -->
          <div class="prize-info-section">
            <h2>🏆 獎項資訊</h2>
            <div class="prize-list">
              <div class="prize-card-list">
                <div
                  class="prize-info-card"
                  v-for="(prize, index) in lotteryData.prizes"
                  :key="prize.name"
                >
                  <div class="prize-row">
                    <div class="prize-name">{{ getPrizeLabel(index) }}</div>
                    <div class="prize-label">{{ prize.name }}</div>
                    <div class="prize-meta">
                      <span class="prize-count-large">{{ getRemainingCount(prize.name) }}<span class="prize-meta-divider">/</span>{{ prize.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="player-section">
              <div class="player-input">
                <label for="playerId">抽獎者 ID:</label>
                <input 
                  id="playerId"
                  v-model="currentPlayerId" 
                  type="text" 
                  placeholder="請輸入您的 ID 或姓名"
                  @keyup.enter="selectCard"
                />
              </div>
              
              <!-- 快速抽獎選項 -->
              <div class="quick-draw-options">
                <div class="option-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="skipAnimation"
                    />
                    <span>跳過動畫</span>
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="autoSelectCard"
                    />
                    <span>自動選號</span>
                  </label>
                </div>
                
                <!-- 快速抽獎按鈕 -->
                <button 
                  v-if="currentPlayerId.trim() && autoSelectCard" 
                  @click="quickDraw" 
                  class="quick-draw-btn"
                >
                  ⚡ 快速抽獎
                </button>
              </div>
            </div>


          </div>
        </div>

        <!-- 抽獎記錄 -->
        <div class="records-section" v-if="drawRecords.length > 0">
          <div class="record-header">
            <h2>抽獎記錄</h2>
            <div class="record-buttons">
              <button @click="downloadRecords" class="download-btn">下載表格</button>
              
            </div>
          </div>
          <!-- 使用表格顯示抽獎記錄 -->
          <table class="records-table">
            <thead>
              <tr>
                <th>抽獎者 ID</th>
                <th>獎項</th>
                <th style="width: 400px;">獎品名稱</th>
                <th>卡號</th>
                <th>抽獎時間</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(record, index) in drawRecords" :key="index">
                <td>{{ record.playerId }}</td>
                <td>{{ getPrizeLabelByName(record.prize) }}</td>
                <td>{{ record.prize }}</td>
                <td>#{{ record.cardNumber }}</td>
                <td>{{ formatTime(record.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="clearRecords" class="clear-btn">清除記錄</button>
        <button @click="resetAll" class="reset-btn">重置抽獎</button>
      </div>

      <!-- 載入中 -->
      <div v-else class="loading">
        <div class="loading-spinner"></div>
        <p>載入中...</p>
      </div>
    </div>

    <!-- 抽獎結果動畫 -->
    <div v-if="showResultAnimation" class="result-animation-overlay" @click="closeResultAnimation">
      <div class="result-animation-container">
 
        <div 
          id="Awesome" 
          class="anim750"
          :class="{ 'peeled': isPeeled }"
          @mousedown="startDrag"
          @mousemove="onDrag"
          @mouseup="endDrag"
          @mouseleave="endDrag"
        >
	
          <div class="reveal rectangle_wrapper">
            <div class="rectangle">
              <h2>恭喜中獎！</h2>
              <p>抽中 {{ lastDrawResult.prize }}！</p>
            </div>
          </div>
                    
          <div class="sticky anim750">
            <div class="front rectangle_wrapper anim750">
              <div class="rectangle anim750"></div>
            </div>
          </div>
          
          <h4>點擊並拖曳往右撕開！</h4>
          <div class="drag-indicator">
            <span>← 拖曳往右 →</span>
          </div>
                    
          <div class="sticky anim750">
            <div class="back rectangle_wrapper anim750">
              <div class="rectangle anim750"></div>
            </div>
          </div>
                    
        </div>
        <div class="confetti-container">
          <div v-for="i in 20" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

/**
 * 路由參數
 */
const lotteryId = route.params.lotteryId

/**
 * 頁面狀態
 */
const lotteryData = ref(null)
const error = ref('')
const loading = ref(true)

/**
 * 抽獎相關
 */
const cards = ref([])
const currentPlayerId = ref('')
const selectedCardIndex = ref(null)
const drawRecords = ref([])

/**
 * 快速抽獎選項
 */
const skipAnimation = ref(false)
const autoSelectCard = ref(false)

/**
 * 抽獎結果動畫
 */
const showResultAnimation = ref(false)
const lastDrawResult = ref({})

/**
 * 撕開效果相關
 */
const isPeeled = ref(false)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragDistance = ref(0)

/**
 * 計算剩餘卡片數量
 */
const remainingCards = computed(() => {
  return cards.value.filter(card => !card.isDrawn).length
})

/**
 * 根據卡片數量決定網格大小類別
 */
const gridSizeClass = computed(() => {
  const totalCards = cards.value.length
  if (totalCards <= 20) {
    return 'small-grid'
  } else if (totalCards <= 50) {
    return 'medium-grid'
  } else if (totalCards <= 100) {
    return 'large-grid'
  } else {
    return 'extra-large-grid'
  }
})

/**
 * 取得網格模式文字說明
 */
const getGridModeText = () => {
  const totalCards = cards.value.length
  if (totalCards <= 20) {
    return '(大尺寸模式)'
  } else if (totalCards <= 50) {
    return '(標準模式)'
  } else if (totalCards <= 100) {
    return '(緊湊模式)'
  } else {
    return '(超緊湊模式)'
  }
}

/**
 * 頁面載入時初始化
 */
onMounted(() => {
  loadLotteryData()
})

/**
 * 載入抽獎資料
 */
const loadLotteryData = () => {
  try {
    const storedData = localStorage.getItem(`lottery_${lotteryId}`)
    if (!storedData) {
      error.value = '找不到此抽獎活動，可能已被刪除或 ID 錯誤'
      return
    }

    lotteryData.value = JSON.parse(storedData)
    
    // 設定動態 CSS 變數
    if (lotteryData.value.primaryColor && lotteryData.value.secondaryColor) {
      document.documentElement.style.setProperty('--primary-color', lotteryData.value.primaryColor)
      document.documentElement.style.setProperty('--secondary-color', lotteryData.value.secondaryColor)
    }
    
    generateCards()
    loadRecords()
  } catch (err) {
    error.value = '載入抽獎資料時發生錯誤'
    console.error(err)
  }
}

/**
 * 重置所有抽獎記錄
 */
const resetAllRecords = () => {
  // 清空抽獎記錄
  drawRecords.value = []
  localStorage.removeItem(`records_${lotteryId}`)
  
  // 清空卡片分配，讓下次重新生成
  localStorage.removeItem(`cards_${lotteryId}`)
  
  // 重置卡片狀態
  cards.value.forEach(card => {
    card.isDrawn = false
  })
}

/**
 * 生成抽獎牌
 */
const generateCards = () => {
  // 檢查是否已有保存的卡片分配
  const savedCards = localStorage.getItem(`cards_${lotteryId}`)
  
  if (savedCards) {
    // 如果有保存的分配，使用保存的
    cards.value = JSON.parse(savedCards)
  } else {
    // 如果沒有保存的分配，創建新的
    cards.value = []
    let cardNumber = 1
    
    // 先創建所有獎品的陣列
    const allPrizes = []
    lotteryData.value.prizes.forEach(prize => {
      for (let i = 0; i < prize.quantity; i++) {
        allPrizes.push(prize.name)
      }
    })
    
    // 打亂獎品順序
    allPrizes.sort(() => Math.random() - 0.5)
    
    // 按照數字順序分配獎品
    allPrizes.forEach(prizeName => {
      cards.value.push({
        number: cardNumber++,
        prize: prizeName,
        isDrawn: false
      })
    })
    
    // 保存卡片分配
    localStorage.setItem(`cards_${lotteryId}`, JSON.stringify(cards.value))
  }
}

/**
 * 載入抽獎記錄
 */
const loadRecords = () => {
  const storedRecords = localStorage.getItem(`records_${lotteryId}`)
  if (storedRecords) {
    drawRecords.value = JSON.parse(storedRecords)
    // 根據記錄更新卡片狀態
    updateCardsFromRecords()
  }
}

/**
 * 根據抽獎記錄更新卡片狀態
 */
const updateCardsFromRecords = () => {
  drawRecords.value.forEach(record => {
    const card = cards.value.find(card => card.number === record.cardNumber)
    if (card) {
      card.isDrawn = true
    }
  })
  // 保存更新後的卡片狀態
  localStorage.setItem(`cards_${lotteryId}`, JSON.stringify(cards.value))
}

/**
 * 儲存抽獎記錄
 */
const saveRecords = () => {
  localStorage.setItem(`records_${lotteryId}`, JSON.stringify(drawRecords.value))
}

/**
 * 選擇抽獎牌
 */
const selectCard = (index) => {
  if (!currentPlayerId.value.trim()) {
    alert('請先輸入抽獎者 ID')
    return
  }
  
  if (cards.value[index].isDrawn) {
    alert('此牌已被抽走')
    return
  }
  
  selectedCardIndex.value = index
  
  // 選到卡片時直接抽獎，根據跳過動畫選項
  if (skipAnimation.value) {
    drawCard({ skipAnimation: true })
  } else {
    drawCard()
  }
}

/**
 * 快速抽獎
 */
const quickDraw = () => {
  if (!currentPlayerId.value.trim()) {
    alert('請輸入抽獎者 ID')
    return
  }
  // 如果啟用自動選號，隨機選擇一張未抽的卡片
  if (autoSelectCard.value) {
    const availableCards = cards.value.filter(card => !card.isDrawn)
    if (availableCards.length === 0) {
      alert('沒有剩餘的抽獎牌了！')
      return
    }
    const randomIndex = Math.floor(Math.random() * availableCards.length)
    const randomCard = availableCards[randomIndex]
    selectedCardIndex.value = cards.value.findIndex(card => card.number === randomCard.number)
  }
  // 如果沒有選擇卡片，提示選擇
  if (selectedCardIndex.value === null) {
    alert('請選擇一張抽獎牌')
    return
  }
  // 只要勾選跳過動畫就直接跳過動畫
  drawCard({ skipAnimation: skipAnimation.value || (autoSelectCard.value && skipAnimation.value) })
}

/**
 * 抽獎
 * @param {Object} [options] - 選項
 * @param {boolean} [options.skipAnimation] - 是否跳過動畫
 */
const drawCard = (options = {}) => {
  if (!currentPlayerId.value.trim()) {
    alert('請輸入抽獎者 ID')
    return
  }
  if (selectedCardIndex.value === null) {
    alert('請選擇一張抽獎牌')
    return
  }
  const selectedCard = cards.value[selectedCardIndex.value]
  // 記錄抽獎結果
  const record = {
    playerId: currentPlayerId.value.trim(),
    prize: selectedCard.prize,
    cardNumber: selectedCard.number,
    timestamp: new Date()
  }
  drawRecords.value.unshift(record)
  saveRecords()
  // 標記為已抽
  selectedCard.isDrawn = true
  // 保存卡片狀態
  localStorage.setItem(`cards_${lotteryId}`, JSON.stringify(cards.value))
  // 清空選擇和抽獎者
  selectedCardIndex.value = null
  // 顯示抽獎結果動畫（除非skipAnimation為true）
  lastDrawResult.value = record
  if (!options.skipAnimation) {
    showResultAnimation.value = true
    // 初始化撕開效果
    initPeelEffect()
  }
}

/**
 * 取得獎項剩餘數量
 */
const getRemainingCount = (prizeName) => {
  return cards.value.filter(card => 
    card.prize === prizeName && !card.isDrawn
  ).length
}

/**
 * 計算獎項剩餘百分比 (個別獎項剩餘 / 所有剩餘卡片總數)
 */
const getPercentage = (prizeName, remainingTotal) => {
  const remaining = getRemainingCount(prizeName)
  if (remainingTotal === 0) return 0
  return Math.round((remaining / remainingTotal) * 100)
}

/**
 * 格式化時間
 */
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * 清除記錄
 */
const clearRecords = () => {
  if (confirm('確定要清除所有抽獎記錄嗎？')) {
    drawRecords.value = []
    saveRecords()
  }
}

/**
 * 重置所有
 */
const resetAll = () => {
  if (confirm('確定要重置所有抽獎嗎？這將清空所有記錄並重新開始。')) {
    resetAllRecords()
  }
}

/**
 * 下載抽獎紀錄為CSV檔案
 * @returns {void}
 */
const downloadRecords = () => {
  if (!drawRecords.value.length) return
  // 欄位標題
  const headers = ['抽獎者ID', '獎項', '獎品名稱', '卡號', '抽獎時間']
  // 內容
  const rows = drawRecords.value.map(record => [
    record.playerId,
    getPrizeLabelByName(record.prize),
    record.prize,
    `#${record.cardNumber}`,
    formatTime(record.timestamp)
  ])
  // 轉成CSV字串，前面加上UTF-8 BOM
  const csvContent = '\uFEFF' + [headers, ...rows]
    .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  // 下載
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lottery_${lotteryId}_records.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 開始拖曳
 */
const startDrag = (event) => {
  isDragging.value = true
  dragStartX.value = event.clientX
  dragDistance.value = 0
}

/**
 * 拖曳中
 */
const onDrag = (event) => {
  if (!isDragging.value) return
  
  const currentX = event.clientX
  dragDistance.value = currentX - dragStartX.value
  
  // 如果拖曳距離超過 100px，觸發撕開效果
  if (dragDistance.value > 100) {
    isPeeled.value = true
    isDragging.value = false
  }
}

/**
 * 結束拖曳
 */
const endDrag = () => {
  isDragging.value = false
  dragDistance.value = 0
}

/**
 * 初始化撕開效果
 */
const initPeelEffect = () => {
  nextTick(() => {
    // 重置狀態
    isPeeled.value = false
    isDragging.value = false
    dragDistance.value = 0
    console.log('撕開效果初始化完成')
  })
}



/**
 * 關閉抽獎結果動畫
 */
const closeResultAnimation = () => {
  showResultAnimation.value = false
}

/**
 * 取得彩帶樣式
 */
const getConfettiStyle = (index) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const animationDelay = Math.random() * 3
  const animationDuration = 2 + Math.random() * 2
  
  return {
    left: `${left}%`,
    backgroundColor: color,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`
  }
}

/**
 * 根據索引取得獎項標籤（A賞、B賞...）
 * @param {number} index - 獎項索引
 * @returns {string} - 標籤
 */
const getPrizeLabel = (index) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (index < 26) {
    return `${alphabet[index]}賞`
  }
  const first = Math.floor(index / 26) - 1
  const second = index % 26
  return `${alphabet[first]}${alphabet[second]}賞`
}

/**
 * 根據獎項名稱取得獎項標籤（A賞、B賞...）
 * @param {string} prizeName - 獎項名稱
 * @returns {string} - 標籤
 */
const getPrizeLabelByName = (prizeName) => {
  if (!lotteryData.value || !lotteryData.value.prizes) return ''
  const index = lotteryData.value.prizes.findIndex(prize => prize.name === prizeName)
  if (index === -1) return ''
  return getPrizeLabel(index)
}

/**
 * 計算獎項剩餘機率（百分比字串）
 * @param {number} remaining - 剩餘數量
 * @param {number} total - 剩餘總數
 * @returns {string} - 百分比（兩位小數）
 */
const getPrizeProbability = (remaining, total) => {
  if (!total || remaining === 0) return '0%'
  const percent = (remaining / total) * 100
  return percent.toFixed(2) + '%'
}

/**
 * 回到設定頁面
 */
const goToSetup = () => {
  router.push('/')
}
</script>

<style scoped>

.lottery-container {
  max-width: 1800px;
  margin: 0 auto;
  background: white;
  overflow: hidden;
}

.lottery-header {
  color: var(--primary-color, #667eea);
  text-align: center;
  padding: 30px 20px;
}

.lottery-title {
  font-size: 3rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: bold;
}

.lottery-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.error-message {
  text-align: center;
  padding: 60px 20px;
  color: #dc3545;
}

.error-message h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.setup-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
}

.lottery-content {
  padding: 10px;
}

.player-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.player-section h2 {
  color: #2c3e50;
  margin-bottom: 16px;
  font-size: 1.3rem;
}

.player-input {
  display: flex;
  gap: 16px;
  align-items: end;
  flex-wrap: wrap;
}

.player-input label {
  font-weight: 600;
  color: #495057;
}

.player-input input {
  flex: 1;
  min-width: 200px;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.player-input input:focus {
  outline: none;
  border-color: #667eea;
}

.quick-draw-options {
  padding: 16px;
}

.option-group {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.quick-draw-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.quick-draw-btn:hover {
  background: linear-gradient(135deg, #ee5a24 0%, #d63031 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.main-lottery-area {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.cards-section h2,
.prize-info-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.grid-mode-indicator {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: normal;
  margin-left: 10px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
}

/* 根據卡片數量動態調整大小 */
.cards-grid.small-grid {
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.cards-grid.medium-grid {
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 8px;
}

.cards-grid.large-grid {
  grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
  gap: 8px;
}

.cards-grid.extra-large-grid {
  grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
  font-size: 5px;
  gap: 2px;
}

.card {
  aspect-ratio: 1;
  background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  font-weight: bold;
}

.card:hover:not(.drawn) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.card.selected {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.card.drawn {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.card-drawn-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.card-number {
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
}

/* 根據卡片數量調整字體大小 */
.small-grid .card-number {
  font-size: 1.6rem;
}

.medium-grid .card-number {
  font-size: 1.4rem;
}

.large-grid .card-number {
  font-size: 1.2rem;
}

.extra-large-grid .card-number {
  font-size: 1rem;
}

.prize-list {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.prize-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.prize-item:last-child {
  margin-bottom: 0;
}

.prize-name {
  font-weight: 600;
  color: #495057;
}

.prize-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.remaining {
  font-weight: bold;
  color: #28a745;
  font-size: 1.1rem;
}

.total {
  color: #6c757d;
}

.percentage {
  color: #17a2b8;
  font-size: 0.9rem;
  font-weight: 500;
}

.draw-section {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.selected-card-info {
  margin-bottom: 16px;
}

.selected-card-info p {
  margin: 8px 0;
  color: #1976d2;
  font-weight: 500;
}

.draw-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.draw-btn:hover {
  background: #218838;
}

.records-section {
  border-top: 2px solid #e9ecef;
  padding-top: 30px;
}

.records-section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.records-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.record-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.player-id {
  font-weight: 600;
  color: #495057;
}

.prize-name {
  color: #007bff;
  font-weight: 500;
}

.card-number {
  font-size: 0.9rem;
  color: #ffffff;
}

.record-time {
  color: #6c757d;
  font-size: 0.9rem;
}

.record-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.clear-btn:hover {
  background: #5a6268;
}

.reset-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #c82333;
}

.download-btn {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}
.download-btn:hover {
  background: #125ea6;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 抽獎結果動畫樣式 */
.result-animation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.result-animation-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.anim750 {
  transition: all 750ms ease-in-out;
}
.anim750{
  transition: all 750ms ease-in-out;
}

#Awesome{
	position: relative;
	width: 300px;
	height: 200px;
	margin: 0 auto;
  backface-visibility: hidden;
  cursor: grab;
  user-select: none;
}

#Awesome:active {
  cursor: grabbing;
}

#Awesome .sticky{
	transform: rotate(0deg);
}

#Awesome.peeled .sticky{
	transform: rotate(0deg);
}

#Awesome .sticky{
	position: absolute;
	top: 0;
	left: 0;
	width: 300px;
	height: 200px;
}

#Awesome .reveal .rectangle{
	box-shadow: 0 1px 0px rgba(0,0,0,.15);
  
  font-family: 'helvetica neue', arial;
  font-weight: 200;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  cursor: pointer;
}

#Awesome .reveal .rectangle h2 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  color: #333;
}

#Awesome .reveal .rectangle p {
  margin: 0;
  font-size: 1.2rem;
  color: #666;
}

#Awesome .reveal .rectangle{
	background: #fafafa;
}

#Awesome .rectangle_wrapper{
	position: absolute;
	width: 300px;
	height: 200px;
	left: 0px;
	top: 0px;
	overflow: hidden;
}

#Awesome .rectangle{
	position: absolute;
	width: 260px;
	height: 160px;
	margin: 20px;
	
	border-radius: 12px;
}

#Awesome .back{
	width: 10px;
	left: 30px;
}

#Awesome.peeled .back{
	width: 500px;
	left: 60px;
}

#Awesome .back .rectangle{
	margin-left: -500px;
  right: -10px;
	background-color: #14a739;

	background-image: -webkit-linear-gradient(right, rgba(251,236,63,.0), rgba(255,255,255,.8));
}

#Awesome.peeled .back .rectangle{
	margin-left: -10px;
}

#Awesome .front{
	width: 310px;
	right: -30px;
	left: auto;
	
}

#Awesome.peeled .front{
	width: 0px;
	
}

#Awesome .front .rectangle{
	margin-left: 0px;
	background: var(--primary-color, #667eea);

	background-image: -webkit-linear-gradient(right, rgba(251,236,63,.0) 75%, var(--primary-color, #667eea) 95%);
  background-image: -moz-linear-gradient(right, rgba(251,236,63,.0) 75%, var(--primary-color, #667eea) 95%);
  background-image: linear-gradient(right, rgba(251,236,63,.0) 75%, var(--primary-color, #667eea) 95%);
}

#Awesome h4{
  font-family: 'helvetica neue', arial;
  font-weight: 200;
  text-align: center;
	position: absolute;
	width: 300px;
	height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
	
	transition: opacity 50ms linear 400ms;
}

#Awesome.peeled h4{
	opacity: 0;
	
	transition: opacity 50ms linear 300ms;
}

#Awesome.peeled .front .rectangle{
	margin-left: -300px;
	background-color: #e2d439;
	background-position: 300px 0;
}

.drag-indicator {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  animation: pulse 2s ease-in-out infinite;
}

#Awesome.peeled .drag-indicator {
  opacity: 0;
  transition: opacity 0.3s ease;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.winner-name {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.prize-name {
  font-size: 1.4rem;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.card-number {
  font-size: 1.2rem;
  margin-bottom: 15px;
  opacity: 0.9;
}

.congrats-text {
  font-size: 1.6rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: bounce 1s ease-in-out infinite;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  animation: confettiFall linear infinite;
}

@keyframes cardAppear {
  0% {
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes flipIn {
  0% {
    transform: rotateY(90deg);
    opacity: 0;
  }
  100% {
    transform: rotateY(0deg);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes confettiFall {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@media (max-width: 1400px) {
  .main-lottery-area {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }
  
  /* 在小螢幕上調整網格大小 */
  .cards-grid.small-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .cards-grid.medium-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .cards-grid.large-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }
  
  .cards-grid.extra-large-grid {
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  }
}

@media (max-width: 768px) {
  
  .lottery-content {
    padding: 20px;
  }
  
  .player-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }
  
  /* 在手機上進一步調整網格大小 */
  .cards-grid.small-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .cards-grid.medium-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  }
  
  .cards-grid.large-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  }
  
  .cards-grid.extra-large-grid {
    grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
  }
  
  .record-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .record-info {
    flex-direction: column;
    gap: 4px;
  }
}

@media (min-width: 1920px) {
  .lottery-container {
    max-width: 1920px;
  }
  
  .lottery-header h1 {
    font-size: 3rem;
  }
  
  .lottery-header p {
    font-size: 1.3rem;
  }
  
  .lottery-content {
    padding: 40px;
  }
  
  .player-input input {
    padding: 16px;
    font-size: 16px;
  }
  
  /* 在大螢幕上調整網格大小 */
  .cards-grid.small-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 24px;
  }
  
  .cards-grid.medium-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 20px;
  }
  
  .cards-grid.large-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 16px;
  }
  
  .cards-grid.extra-large-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }
  
  .cards-grid {
    max-height: 700px;
  }
  
  .card-number {
    font-size: 1.6rem;
  }
  
  .draw-btn {
    padding: 20px 40px;
    font-size: 18px;
  }
}

.prize-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.prize-table th, .prize-table td {
  border: 1px solid #dee2e6;
  padding: 10px 8px;
  text-align: center;
}
.prize-table th {
  background: #f1f3f4;
  color: #495057;
  font-weight: 600;
}

.prize-card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}
.prize-info-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 20px 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border: 2px solid #f1f3f4;
  transition: box-shadow 0.2s;
}
.prize-info-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  border-color: #b3b7ff;
}
.prize-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 10px;
}
.prize-meta {
  display: flex;
  flex-direction: row;
  gap: 12px;
  font-size: 0.98rem;
  color: #495057;
}
.prize-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0;
}
.prize-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0;
  flex: 1 1 0;
  text-align: left;
}
.prize-meta {
  display: flex;
  flex-direction: row;
  gap: 12px;
  font-size: 0.98rem;
  color: #495057;
  flex: 1 1 0;
  justify-content: right;
}
.prize-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #34495e;
  flex: 1 1 0;
  text-align: center;
}
.prize-meta-divider {
  margin: 0 2px;
  color: #adb5bd;
}
.prize-count-large {
  font-size: 0.8rem;
  font-weight: bold;
  color: #222;
}

/* 抽獎記錄表格樣式 */
.records-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.records-table th, .records-table td {
  border: 1px solid #e9ecef;
  padding: 10px 8px;
  text-align: center;
  font-size: 1rem;
}
.records-table th {
  background: #f1f3f4;
  color: #495057;
  font-weight: 600;
}
.records-table tr:nth-child(even) {
  background: #f8f9fa;
}
.records-table tr:hover {
  background: #e3f2fd;
}

/* 抽獎記錄區塊標題與按鈕排版 */
.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}
.record-header h2 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
}
.record-buttons {
  display: flex;
  gap: 12px;
}
</style> 