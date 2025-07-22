<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Lock, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const resetSuccess = ref(false)
const resetFormRef = ref()

const resetForm = reactive({
  password: '',
  confirmPassword: '',
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請確認密碼'))
  } else if (value !== resetForm.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 8, message: '密碼長度至少 8 個字符', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}

const handleResetPassword = async () => {
  try {
    const valid = await resetFormRef.value.validate()
    if (!valid) return

    const token = route.query.token
    if (!token) {
      ElMessage.error('重設連結無效或已過期')
      router.push('/forgot-password')
      return
    }

    loading.value = true

    const response = await api.post(`/auth/reset-password/${token}`, {
      password: resetForm.password,
    })

    if (response.success) {
      resetSuccess.value = true
      ElMessage.success('密碼重設成功')
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('重設密碼失敗:', error)
    const message = error.response?.data?.message || error.message

    if (message.includes('expired') || message.includes('invalid')) {
      ElMessage.error('重設連結已過期或無效，請重新申請')
      router.push('/forgot-password')
    } else {
      ElMessage.error(message || '重設密碼失敗，請稍後再試')
    }
  } finally {
    loading.value = false
  }
}

const checkResetToken = async () => {
  const token = route.query.token
  if (!token) {
    ElMessage.error('重設連結無效')
    router.push('/forgot-password')
    return
  }
}

onMounted(() => {
  checkResetToken()
})
</script>

<template>
  <div class="reset-password-page">
    <div class="reset-container">
      <el-card class="reset-card">
        <template #header>
          <div class="card-header">
            <h2>重設密碼</h2>
            <p>請輸入您的新密碼</p>
          </div>
        </template>

        <!-- 重設密碼表單 -->
        <div v-if="!resetSuccess" class="reset-form">
          <el-form
            ref="resetFormRef"
            :model="resetForm"
            :rules="resetRules"
            label-width="0"
            size="large"
          >
            <el-form-item prop="password">
              <el-input
                v-model="resetForm.password"
                placeholder="請輸入新密碼"
                type="password"
                show-password
                :prefix-icon="Lock"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="resetForm.confirmPassword"
                placeholder="請再次輸入密碼"
                type="password"
                show-password
                :prefix-icon="Lock"
                @keyup.enter="handleResetPassword"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                @click="handleResetPassword"
                style="width: 100%"
              >
                重設密碼
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 重設成功 -->
        <div v-else class="success-message">
          <div class="success-icon">
            <el-icon size="64" color="#67C23A">
              <CircleCheck />
            </el-icon>
          </div>

          <h3>密碼重設成功！</h3>
          <p>您的密碼已成功更新，現在可以使用新密碼登入</p>

          <div class="success-actions">
            <el-button type="primary" size="large" @click="$router.push('/login')">
              立即登入
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.reset-container {
  width: 100%;
  max-width: 420px;
}

.reset-card {
  border-radius: 12px;
}

.card-header {
  text-align: center;
  margin-bottom: 0;
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-weight: 600;
}

.card-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 20px;
}

.success-message h3 {
  margin: 0 0 16px 0;
  color: #67c23a;
  font-size: 20px;
  font-weight: 600;
}

.success-message p {
  margin: 8px 0 32px 0;
  color: #606266;
  line-height: 1.5;
}

.success-actions {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .reset-container {
    max-width: 100%;
  }

  .success-actions .el-button {
    width: 100%;
  }
}
</style>
