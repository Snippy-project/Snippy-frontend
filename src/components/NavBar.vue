<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userQuota = ref(null)

const activeIndex = computed(() => route.path)

// 處理選單選擇
const handleMenuSelect = (index) => {
  router.push(index)
}

// 處理用戶下拉選單
const handleUserCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'quota':
      router.push('/profile')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

// 處理登出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('確定要登出嗎？', '確認登出', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authStore.logout()
    router.push('/')
  } catch {}
}

// 取得用戶配額
const fetchUserQuota = async () => {
  if (!authStore.isLoggedIn) return

  try {
    const response = await api.get('/users/quota')
    if (response.success) {
      userQuota.value = response.data
    }
  } catch (error) {
    console.error('取得配額失敗:', error)
  }
}

// 監聽登入狀態變化
onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchUserQuota()
  }
})
</script>

<template>
  <el-affix>
    <el-container class="navbar">
      <el-header height="64px" class="navbar-header">
        <div class="navbar-content">
          <!-- Logo 和品牌名 -->
          <div class="brand" @click="$router.push('/')">
            <el-icon size="28" color="#409EFF">
              <Link />
            </el-icon>
            <span class="brand-name">短網址</span>
          </div>

          <!-- 導航選單 -->
          <el-menu
            v-if="authStore.isLoggedIn"
            :default-active="activeIndex"
            mode="horizontal"
            class="navbar-menu"
            @select="handleMenuSelect"
          >
            <el-menu-item index="/dashboard">
              <el-icon><House /></el-icon>
              <span>儀表板</span>
            </el-menu-item>
            <el-menu-item index="/urls">
              <el-icon><Link /></el-icon>
              <span>我的短網址</span>
            </el-menu-item>
            <el-menu-item index="/products">
              <el-icon><ShoppingBag /></el-icon>
              <span>購買方案</span>
            </el-menu-item>
            <el-menu-item index="/orders">
              <el-icon><List /></el-icon>
              <span>訂單記錄</span>
            </el-menu-item>
          </el-menu>

          <!-- 右側操作區 -->
          <div class="navbar-actions">
            <!-- 未登入狀態 -->
            <template v-if="!authStore.isLoggedIn">
              <el-button @click="$router.push('/products')"> 查看方案 </el-button>
              <el-button @click="$router.push('/login')"> 登入 </el-button>
              <el-button type="primary" @click="$router.push('/register')"> 註冊 </el-button>
            </template>

            <!-- 已登入狀態 -->
            <template v-else>
              <!-- 配額顯示 -->
              <div v-if="userQuota" class="quota-display">
                <el-icon><Coin /></el-icon>
                <span>{{ userQuota.remaining }}/{{ userQuota.total }}</span>
              </div>

              <!-- 用戶選單 -->
              <el-dropdown @command="handleUserCommand">
                <div class="user-dropdown">
                  <el-avatar :size="32">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span class="username">{{ authStore.user?.username }}</span>
                  <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">
                      <el-icon><User /></el-icon>
                      個人資料
                    </el-dropdown-item>
                    <el-dropdown-item command="quota">
                      <el-icon><Coin /></el-icon>
                      配額管理
                    </el-dropdown-item>
                    <el-dropdown-item divided command="logout">
                      <el-icon><SwitchButton /></el-icon>
                      登出
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </div>
        </div>
      </el-header>
    </el-container>
  </el-affix>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-header {
  padding: 0;
  background: white;
}

.navbar-content {
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.navbar-menu {
  flex: 1;
  margin: 0 40px;
  border-bottom: none !important;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quota-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .navbar-content {
    padding: 0 16px;
  }

  .navbar-menu {
    display: none;
  }

  .brand-name {
    font-size: 18px;
  }

  .quota-display {
    display: none;
  }
}
</style>
