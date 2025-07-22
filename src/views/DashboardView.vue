<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import dayjs from 'dayjs'
import RecentUrls from '@/components/RecentUrls.vue'
import CreateUrlDialog from '@/components/CreateUrlDialog.vue'

const authStore = useAuthStore()

// 數據
const userStats = ref({
  quota: null,
  totalUrls: 0,
  totalClicks: 0,
  totalDomains: 0,
})
const recentUrls = ref([])
const activeSubscriptions = ref([])
const showCreateUrl = ref(false)

// 計算屬性
const quotaPercentage = computed(() => {
  if (!userStats.value.quota) return 0
  const { used, total } = userStats.value.quota
  return Math.round((used / total) * 100)
})

const quotaStatus = computed(() => {
  const percentage = quotaPercentage.value
  if (percentage >= 90) return 'exception'
  if (percentage >= 80) return 'warning'
  return 'success'
})

// 取得用戶統計
const fetchUserStats = async () => {
  try {
    const [profileRes, quotaRes] = await Promise.all([
      api.get('/users/profile'),
      api.get('/users/quota'),
    ])

    if (profileRes.success) {
      userStats.value = {
        ...userStats.value,
        ...profileRes.data.stats,
      }
      activeSubscriptions.value = profileRes.data.subscriptions || []
    }

    if (quotaRes.success) {
      userStats.value.quota = quotaRes.data
    }
  } catch (error) {
    console.error('取得用戶統計失敗:', error)
  }
}

// 取得最近的短網址
const fetchRecentUrls = async () => {
  try {
    const response = await api.get('/urls?page=1&limit=5')
    if (response.success) {
      recentUrls.value = response.data
    }
  } catch (error) {
    console.error('取得最近短網址失敗:', error)
  }
}

// 處理短網址創建成功
const handleUrlCreated = () => {
  fetchUserStats()
  fetchRecentUrls()
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 取得訂閱名稱
const getSubscriptionName = (type) => {
  const names = {
    custom_domain: '自訂域名（月費）',
    custom_domain_yearly: '自訂域名（年費）',
  }
  return names[type] || type
}

// 初始化
onMounted(() => {
  fetchUserStats()
  fetchRecentUrls()
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <!-- 頁面標題 -->
      <div class="dashboard-header">
        <h1>主控臺</h1>
        <p>歡迎回來，{{ authStore.user?.username }}！</p>
      </div>

      <!-- 統計卡片 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon quota">
                <el-icon size="24"><Coin /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.quota?.remaining || 0 }}</div>
                <div class="stat-label">剩餘配額</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon urls">
                <el-icon size="24"><Link /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.totalUrls || 0 }}</div>
                <div class="stat-label">短網址數量</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon clicks">
                <el-icon size="24"><View /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.totalClicks || 0 }}</div>
                <div class="stat-label">總點擊數</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="12" :lg="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon domains">
                <el-icon size="24"><Globe /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ userStats.totalDomains || 0 }}</div>
                <div class="stat-label">自訂域名</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 配額進度 -->
      <el-row :gutter="20" class="mt-4">
        <el-col :xs="24" :lg="16">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>配額使用情況</span>
                <el-button type="primary" size="small" @click="$router.push('/products')">
                  購買配額
                </el-button>
              </div>
            </template>

            <div class="quota-progress">
              <div class="quota-info">
                <span>已使用：{{ userStats.quota?.used || 0 }}</span>
                <span>總配額：{{ userStats.quota?.total || 0 }}</span>
              </div>
              <el-progress :percentage="quotaPercentage" :stroke-width="12" :status="quotaStatus" />
              <div class="quota-warning" v-if="quotaPercentage > 80">
                <el-alert
                  title="配額即將用完"
                  description="建議購買更多配額以繼續使用服務"
                  type="warning"
                  :closable="false"
                  show-icon
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="8">
          <el-card>
            <template #header>
              <span>快速操作</span>
            </template>

            <div class="quick-actions">
              <el-button
                type="primary"
                size="large"
                @click="showCreateUrl = true"
                style="width: 100%; margin-bottom: 12px"
              >
                <el-icon><Plus /></el-icon>
                創建短網址
              </el-button>

              <el-button
                size="large"
                @click="$router.push('/urls')"
                style="width: 100%; margin-bottom: 12px"
              >
                <el-icon><List /></el-icon>
                管理短網址
              </el-button>

              <el-button size="large" @click="$router.push('/orders')" style="width: 100%">
                <el-icon><ShoppingBag /></el-icon>
                查看訂單
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最近的短網址 -->
      <el-card class="mt-4">
        <template #header>
          <div class="card-header">
            <span>最近創建的短網址</span>
            <el-button type="text" @click="$router.push('/urls')"> 查看全部 </el-button>
          </div>
        </template>

        <RecentUrls :urls="recentUrls" @refresh="fetchRecentUrls" />
      </el-card>

      <!-- 訂閱狀態 -->
      <el-card v-if="activeSubscriptions.length > 0" class="mt-4">
        <template #header>
          <span>我的訂閱</span>
        </template>

        <div class="subscriptions">
          <div
            v-for="subscription in activeSubscriptions"
            :key="subscription.id"
            class="subscription-item"
          >
            <div class="subscription-info">
              <h4>{{ getSubscriptionName(subscription.type) }}</h4>
              <p>到期時間：{{ formatDate(subscription.endDate) }}</p>
            </div>
            <div class="subscription-status">
              <el-tag :type="subscription.daysRemaining > 7 ? 'success' : 'warning'">
                剩餘 {{ subscription.daysRemaining }} 天
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 創建短網址對話框 -->
    <CreateUrlDialog v-model="showCreateUrl" @created="handleUrlCreated" />
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 24px;
}

.dashboard-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.dashboard-header p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.stats-row {
  margin-bottom: 0;
}

.stat-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-icon.quota {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.urls {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.clicks {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.domains {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quota-progress {
  padding: 8px 0;
}

.quota-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #606266;
}

.quota-warning {
  margin-top: 16px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
}

.subscriptions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.subscription-info h4 {
  margin: 0 0 4px 0;
  color: #303133;
  font-size: 16px;
}

.subscription-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .dashboard-header h1 {
    font-size: 24px;
  }

  .stat-content {
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 20px;
  }

  .subscription-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
