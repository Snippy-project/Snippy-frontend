<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { User, Message, Lock, CircleCheck, Phone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

const registerFormRef = ref()
const agreeTerms = ref(false)
const showSuccess = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)
const resendLoading = ref(false)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請確認密碼'))
  } else if (value !== registerForm.password) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 2, max: 50, message: '用戶名長度在 2 到 50 個字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/,
      message: '用戶名只能包含中英文、數字、底線和連字號',
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '請輸入信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的信箱格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字符', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
  phone: [
    { required: true, message: "請輸入電話(無需加'-')", trigger: 'blur' },
    { min: 10, message: '電話長度至少 10 個字符', trigger: 'blur' },
  ],
}

const handleRegister = async () => {
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return

    const result = await authStore.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      phone: registerForm.phone,
    })

    if (result.success) {
      showSuccess.value = true
    }
  } catch (error) {
    console.error('註冊失敗:', error)
  }
}

const resendEmail = async () => {
  resendLoading.value = true
  try {
    const result = await authStore.resendVerification(registerForm.email)
    if (result.success) {
      ElMessage.success('驗證信已重新發送')
    }
  } catch (error) {
    console.error('重新發送失敗:', error)
  } finally {
    resendLoading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>註冊帳號</h2>
          <p>立即註冊，開始使用Snippy</p>
        </div>
      </template>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="請輸入用戶名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="請輸入信箱"
            type="email"
            :prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="請輸入密碼"
            type="password"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            placeholder="請確認密碼"
            type="password"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="請輸入電話(無需加'-')"
            type="tel"
            :prefix-icon="Phone"
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="agreeTerms" size="large">
            我已閱讀並同意
            <el-button link type="primary" @click="showTerms = true"> 服務條款 </el-button>
            和
            <el-button link type="primary" @click="showPrivacy = true"> 隱私政策 </el-button>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="authStore.loading"
            :disabled="!agreeTerms"
            @click="handleRegister"
            style="width: 100%"
          >
            註冊帳號
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <span>已經有帳號了？</span>
        <el-button link type="primary" @click="$router.push('/login')"> 立即登入 </el-button>
      </div>
    </el-card>

    <el-dialog
      v-model="showSuccess"
      title="註冊成功！"
      width="400px"
      align-center
      :show-close="false"
    >
      <div class="success-content">
        <el-icon size="64" color="#67C23A">
          <CircleCheck />
        </el-icon>
        <h3>歡迎加入！</h3>
        <p>我們已經發送驗證信到您的信箱</p>
        <p class="email-text">{{ registerForm.email }}</p>
        <p>請點擊信件中的連結完成信箱驗證</p>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resendEmail" :loading="resendLoading"> 重新發送驗證信 </el-button>
          <el-button type="primary" @click="$router.push('/login')"> 前往登入 </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="showTerms" title="服務條款" width="600px" align-center>
      <div class="terms-content">
        <h4>1. 服務說明</h4>
        <p>本服務提供網址縮短功能，幫助用戶將長網址轉換為短網址。</p>

        <h4>2. 使用規範</h4>
        <p>用戶不得使用本服務從事非法或有害活動，包括但不限於：</p>
        <ul>
          <li>傳播惡意軟體或病毒</li>
          <li>進行詐騙或欺詐行為</li>
          <li>侵犯他人智慧財產權</li>
        </ul>

        <h4>3. 配額限制</h4>
        <p>免費用戶每月可創建 20 個短網址，付費用戶根據方案享有不同配額。</p>

        <h4>4. 服務變更</h4>
        <p>我們保留隨時修改或終止服務的權利，但會提前通知用戶。</p>
      </div>
    </el-dialog>

    <el-dialog v-model="showPrivacy" title="隱私政策" width="600px" align-center>
      <div class="privacy-content">
        <h4>1. 資料收集</h4>
        <p>我們僅收集必要的用戶資訊，包括信箱、用戶名和使用統計。</p>

        <h4>2. 資料使用</h4>
        <p>您的資料僅用於：</p>
        <ul>
          <li>提供和改善服務</li>
          <li>用戶身份驗證</li>
          <li>發送重要通知</li>
        </ul>

        <h4>3. 資料保護</h4>
        <p>我們採用業界標準的安全措施保護您的個人資料。</p>

        <h4>4. 第三方分享</h4>
        <p>我們不會將您的個人資料出售或分享給第三方。</p>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 420px;
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

.register-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 14px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-content h3 {
  margin: 16px 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.success-content p {
  margin: 8px 0;
  color: #606266;
  line-height: 1.5;
}

.email-text {
  color: #409eff !important;
  font-weight: 500;
  background: #f0f9ff;
  padding: 8px 16px;
  border-radius: 4px;
  margin: 16px 0 !important;
}

.terms-content,
.privacy-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 8px;
}

.terms-content h4,
.privacy-content h4 {
  color: #303133;
  margin: 16px 0 8px 0;
  font-size: 16px;
}

.terms-content p,
.privacy-content p {
  color: #606266;
  line-height: 1.6;
  margin: 8px 0;
}

.terms-content ul,
.privacy-content ul {
  color: #606266;
  padding-left: 20px;
}

.terms-content li,
.privacy-content li {
  margin: 4px 0;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .register-container {
    padding: 16px;
  }

  .register-card {
    max-width: 100%;
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>
