<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import api from '@/services/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'created'])

// 響應式數據
const formRef = ref()
const loading = ref(false)
const showResult = ref(false)
const quota = ref(null)
const customDomains = ref([])
const createdUrl = ref(null)

// 表單數據
const form = ref({
  originalUrl: '',
  title: '',
  customDomainId: null,
})

// 計算屬性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 驗證規則
const rules = {
  originalUrl: [
    { required: true, message: '請輸入原始網址', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }

        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
        const hasProtocol = /^https?:\/\//.test(value)
        const testUrl = hasProtocol ? value : `https://${value}`

        if (!urlPattern.test(testUrl)) {
          callback(new Error('請輸入有效的網址格式'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  title: [{ max: 100, message: '標題長度不能超過 100 個字符', trigger: 'blur' }],
}

const resetForm = () => {
  form.value = {
    originalUrl: '',
    title: '',
    customDomainId: null,
  }
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    const response = await api.post('/urls', form.value)

    if (response.success) {
      createdUrl.value = response.data
      quota.value = response.quota
      showResult.value = true
      ElMessage.success('短網址創建成功！')
      emit('created', response.data)
    }
  } catch (error) {
    console.error('創建短網址失敗:', error)
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已複製到剪貼板')
    } else {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
        ElMessage.success('已複製到剪貼板')
      } catch (err) {
        ElMessage.error('複製失敗，請手動複製')
      } finally {
        document.body.removeChild(textArea)
      }
    }
  } catch (error) {
    console.error('複製失敗:', error)
    ElMessage.error('複製失敗，請手動複製')
  }
}

const handleCreateAnother = () => {
  showResult.value = false
  resetForm()
}

const handleClose = () => {
  showResult.value = false
  dialogVisible.value = false
}

const fetchQuota = async () => {
  try {
    const response = await api.get('/users/quota')
    if (response.success) {
      quota.value = response.data
    }
  } catch (error) {
    console.error('取得配額失敗:', error)
  }
}

const fetchCustomDomains = async () => {
  try {
    const response = await api.get('/users/domains')
    if (response.success && !response.needsSubscription) {
      customDomains.value = response.data
    }
  } catch (error) {
    console.error('取得自訂域名失敗:', error)
  }
}

watch(dialogVisible, (newValue) => {
  if (newValue) {
    fetchQuota()
    fetchCustomDomains()
  }
})

onMounted(() => {
  fetchQuota()
  fetchCustomDomains()
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="創建短網址"
    width="500px"
    align-center
    @close="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="large">
      <el-form-item label="原始網址" prop="originalUrl">
        <el-input
          v-model="form.originalUrl"
          placeholder="請輸入要縮短的網址，例如：https://example.com"
          type="textarea"
          :rows="3"
        />
      </el-form-item>

      <el-form-item label="標題" prop="title">
        <el-input
          v-model="form.title"
          placeholder="為您的短網址取個好記的名字（可選）"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="customDomains.length > 0" label="自訂域名" prop="customDomainId">
        <el-select
          v-model="form.customDomainId"
          placeholder="選擇自訂域名（可選）"
          clearable
          style="width: 100%"
        >
          <el-option label="使用預設域名" :value="null" />
          <el-option
            v-for="domain in customDomains"
            :key="domain.id"
            :label="domain.domain"
            :value="domain.id"
          />
        </el-select>
      </el-form-item>

      <!-- 配額提醒 -->
      <el-alert
        v-if="quota && quota.remaining <= 0"
        title="配額不足"
        description="您的配額已用完，請先購買更多配額"
        type="error"
        :closable="false"
        show-icon
        class="quota-alert"
      />

      <el-alert
        v-else-if="quota && quota.remaining <= 5"
        title="配額即將用完"
        :description="`您還剩餘 ${quota.remaining} 次使用機會`"
        type="warning"
        :closable="false"
        show-icon
        class="quota-alert"
      />
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="quota && quota.remaining <= 0"
          @click="handleSubmit"
        >
          創建短網址
        </el-button>
      </div>
    </template>

    <!-- 成功結果對話框 -->
    <el-dialog
      v-model="showResult"
      title="短網址創建成功！"
      width="400px"
      align-center
      :show-close="false"
    >
      <div v-if="createdUrl" class="result-content">
        <div class="result-item">
          <label>短網址：</label>
          <div class="url-copy">
            <el-input :model-value="createdUrl.shortUrl" readonly size="large" />
            <el-button
              type="primary"
              @click="copyToClipboard(createdUrl.shortUrl)"
              :icon="DocumentCopy"
            >
              複製
            </el-button>
          </div>
        </div>

        <div class="result-item">
          <label>原始網址：</label>
          <div class="original-url">{{ createdUrl.originalUrl }}</div>
        </div>

        <div v-if="createdUrl.title" class="result-item">
          <label>標題：</label>
          <div>{{ createdUrl.title }}</div>
        </div>

        <div class="result-stats">
          <el-statistic title="剩餘配額" :value="quota?.remaining || 0" />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCreateAnother">再創建一個</el-button>
          <el-button type="primary" @click="handleClose">完成</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<style scoped>
.quota-alert {
  margin-bottom: 16px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #606266;
}

.url-copy {
  display: flex;
  gap: 8px;
}

.url-copy .el-input {
  flex: 1;
}

.original-url {
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}

.result-stats {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .url-copy {
    flex-direction: column;
  }

  .dialog-footer {
    flex-direction: column-reverse;
  }

  .dialog-footer .el-button {
    width: 100%;
  }
}
</style>
