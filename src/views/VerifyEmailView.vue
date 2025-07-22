<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CircleCheck, CircleClose, Loading, Message } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()

const status = ref('loading')
const errorMessage = ref('')
const showResendDialog = ref(false)
const resending = ref(false)
const resendFormRef = ref()

const resendForm = reactive({
  email: '',
})

const resendRules = {
  email: [
    { required: true, message: '請輸入信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的信箱格式', trigger: 'blur' },
  ],
}

const verifyEmail = async () => {
  try {
    const token = route.query.token

    if (!token) {
      throw new Error('驗證碼無效')
    }

    const response = await api.get(`/auth/verify-email/${token}`)

    if (response.success) {
      status.value = 'success'
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('信箱驗證失敗:', error)
    status.value = 'error'

    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message
    } else if (error.response?.data?.error) {
      errorMessage.value = error.response.data.error
    } else if (error.message) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = '驗證失敗'
    }
  }
}

const handleResend = async () => {
  try {
    const valid = await resendFormRef.value.validate()
    if (!valid) return

    resending.value = true

    const response = await api.post('/auth/resend-verification', {
      email: resendForm.email,
    })

    if (response.success) {
      ElMessage.success('驗證信已發送，請檢查您的信箱')
      showResendDialog.value = false
      resendForm.email = ''
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('重新發送失敗:', error)
    ElMessage.error(error.response?.data?.message || '發送失敗，請稍後再試')
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<template>
  <div class="verify-email-page">
    <div class="verify-container">
      <el-card class="verify-card">
        <!-- 成功 -->
        <div v-if="status === 'success'" class="status-content">
          <el-icon size="64" color="#67C23A">
            <CircleCheck />
          </el-icon>
          <h2>信箱驗證成功！</h2>
          <p>您的帳號已成功啟用，現在可以使用完整功能</p>
          <el-button type="primary" @click="$router.push('/login')"> 立即登入 </el-button>
        </div>

        <!-- 失敗 -->
        <div v-else-if="status === 'error'" class="status-content">
          <el-icon size="64" color="#F56C6C">
            <CircleClose />
          </el-icon>
          <h2>驗證失敗</h2>
          <p>{{ errorMessage }}</p>
          <div class="buttons">
            <el-button type="primary" @click="showResendDialog = true"> 重新發送驗證信 </el-button>
            <el-button @click="$router.push('/login')"> 前往登入 </el-button>
          </div>
        </div>

        <!-- 載入中 -->
        <div v-else class="status-content">
          <el-icon size="64" color="#409EFF" class="loading-icon">
            <Loading />
          </el-icon>
          <h2>驗證中...</h2>
          <p>正在驗證您的信箱，請稍候</p>
        </div>
      </el-card>
    </div>

    <!-- 重新發送驗證信對話框 -->
    <el-dialog v-model="showResendDialog" title="重新發送驗證信" width="400px">
      <el-form :model="resendForm" :rules="resendRules" ref="resendFormRef">
        <el-form-item prop="email">
          <el-input
            v-model="resendForm.email"
            placeholder="請輸入您的信箱"
            :prefix-icon="Message"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showResendDialog = false">取消</el-button>
        <el-button type="primary" :loading="resending" @click="handleResend">
          發送驗證信
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.verify-email-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.verify-container {
  max-width: 500px;
  width: 100%;
}

.status-content {
  text-align: center;
  padding: 40px;
}

.status-content h2 {
  margin: 20px 0 10px 0;
}

.status-content p {
  margin-bottom: 30px;
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .status-content {
    padding: 20px;
  }

  .buttons {
    flex-direction: column;
  }
}
</style>
