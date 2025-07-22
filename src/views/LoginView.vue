<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>登入帳號</h2>
          <p>歡迎回來！請登入您的帳號</p>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="請輸入信箱"
            type="email"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="請輸入密碼"
            type="password"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe"> 記住我 </el-checkbox>
            <el-button link type="primary" @click="showForgotPassword = true">
              忘記密碼？
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="authStore.loading"
            @click="handleLogin"
            style="width: 100%"
          >
            登入
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <span>還沒有帳號？</span>
        <el-button link type="primary" @click="$router.push('/register')"> 立即註冊 </el-button>
      </div>
    </el-card>

    <!-- 忘記密碼對話框 -->
    <el-dialog v-model="showForgotPassword" title="忘記密碼" width="400px" align-center>
      <el-form :model="forgotForm" label-width="0">
        <el-form-item>
          <el-input
            v-model="forgotForm.email"
            placeholder="請輸入註冊信箱"
            type="email"
            :prefix-icon="Message"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showForgotPassword = false"> 取消 </el-button>
          <el-button type="primary" :loading="authStore.loading" @click="handleForgotPassword">
            發送重設信
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Message, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref()
const showForgotPassword = ref(false)

// 登入表單
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

// 忘記密碼表單
const forgotForm = reactive({
  email: '',
})

// 驗證規則
const loginRules = {
  email: [
    { required: true, message: '請輸入信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的信箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字符', trigger: 'blur' },
  ],
}

// 處理登入
const handleLogin = async () => {
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    const result = await authStore.login(loginForm)

    if (result.success) {
      router.push(result.redirectUrl || '/dashboard')
    } else {
      // 檢查是否需要驗證信箱
      if (result.needsEmailVerification) {
        ElMessage({
          type: 'warning',
          message: result.message,
          duration: 5000,
        })
      }
    }
  } catch (error) {
    console.error('登入失敗:', error)
  }
}

// 處理忘記密碼
const handleForgotPassword = async () => {
  if (!forgotForm.email) {
    ElMessage.warning('請輸入信箱')
    return
  }

  const result = await authStore.forgotPassword(forgotForm.email)

  if (result.success) {
    showForgotPassword.value = false
    forgotForm.email = ''
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
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

.form-options {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    max-width: 100%;
  }
}
</style>
