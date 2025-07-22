<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import dayjs from 'dayjs'
import RecentUrls from '@/components/RecentUrls.vue'
import CreateUrlDialog from '@/components/CreateUrlDialog.vue'

const authStore = useAuthStore()

const userStats = ref({
  quota: null,
  totalUrls: 0,
  totalDomains: 0,
})
const recentUrls = ref([])
const activeSubscriptions = ref([])
const showCreateUrl = ref(false)

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

const handleUrlCreated = () => {
  fetchUserStats()
  fetchRecentUrls()
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const getSubscriptionName = (type) => {
  const names = {
    custom_domain: '自訂域名（月費）',
    custom_domain_yearly: '自訂域名（年費）',
  }
  return names[type] || type
}

onMounted(() => {
  fetchUserStats()
  fetchRecentUrls()
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>主控臺</h1>
        <p>歡迎回來，{{ authStore.user?.username }}！</p>
      </div>

      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :md="8">
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

        <el-col :xs="24" :md="8">
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

        <el-col :xs="24" :md="8">
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

      <el-card class="mt-4">
        <template #header>
          <span>快速操作</span>
        </template>
        <div class="quick-actions">
          <el-button type="primary" size="large" @click="showCreateUrl = true" class="action-btn">
            <el-icon><Plus /></el-icon>
            創建短網址
          </el-button>
          <el-button size="large" @click="$router.push('/urls')" class="action-btn">
            <el-icon><List /></el-icon>
            管理短網址
          </el-button>
          <el-button size="large" @click="$router.push('/orders')" class="action-btn">
            <el-icon><ShoppingBag /></el-icon>
            查看訂單
          </el-button>
        </div>
      </el-card>

      <el-card class="mt-4">
        <template #header>
          <div class="card-header">
            <span>最近創建的短網址</span>
            <el-button type="text" @click="$router.push('/urls')">查看全部</el-button>
          </div>
        </template>
        <RecentUrls :urls="recentUrls" @refresh="fetchRecentUrls" />
      </el-card>

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
            <el-tag :type="subscription.daysRemaining > 7 ? 'success' : 'warning'">
              剩餘 {{ subscription.daysRemaining }} 天
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

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
}

.stat-icon.quota {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.urls {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.domains {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
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

.quick-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  width: 100%;
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

.mt-4 {
  margin-top: 24px;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .quick-actions {
    flex-direction: column;
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
