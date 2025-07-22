<script setup>
import { ref, reactive } from 'vue'
import { DocumentCopy, Edit, Delete, TopRight, View, Calendar } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import api from '@/services/api'

const props = defineProps({
  urls: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['refresh', 'create'])

// 響應式數據
const showEditDialog = ref(false)
const editingUrl = ref(null)
const updating = ref(false)

const editForm = reactive({
  title: '',
})

// 複製網址
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('已複製到剪貼板')
  } catch (error) {
    // 如果 Clipboard API 不可用，使用 fallback 方法
    try {
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success('已複製到剪貼板')
    } catch (fallbackError) {
      ElMessage.error('複製失敗')
      console.error('複製失敗:', fallbackError)
    }
  }
}

// 編輯網址
const editUrl = (url) => {
  editingUrl.value = url
  editForm.title = url.title || ''
  showEditDialog.value = true
}

// 處理更新
const handleUpdate = async () => {
  if (!editingUrl.value) return

  updating.value = true
  try {
    const response = await api.put(`/urls/${editingUrl.value.id}`, {
      title: editForm.title,
    })

    if (response.success) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
      emit('refresh')
    }
  } catch (error) {
    console.error('更新失敗:', error)
  } finally {
    updating.value = false
  }
}

// 刪除網址
const deleteUrl = async (url) => {
  try {
    await ElMessageBox.confirm(`確定要刪除短網址 "${url.title || url.shortUrl}" 嗎？`, '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await api.delete(`/urls/${url.id}`)

    if (response.success) {
      ElMessage.success('刪除成功')
      emit('refresh')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('刪除失敗:', error)
    }
  }
}

// 截斷長網址
const truncateUrl = (url, maxLength = 50) => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('MM-DD HH:mm')
}
</script>

<template>
  <div class="recent-urls">
    <div v-if="urls.length === 0" class="empty-state">
      <el-empty description="還沒有創建任何短網址">
        <el-button type="primary" @click="$emit('create')"> 創建第一個短網址 </el-button>
      </el-empty>
    </div>

    <div v-else class="urls-list">
      <div v-for="url in urls" :key="url.id" class="url-item">
        <div class="url-content">
          <div class="url-header">
            <div class="url-title">
              <h4>{{ url.title || '無標題' }}</h4>
              <el-tag v-if="url.customDomain" type="success" size="small"> 自訂域名 </el-tag>
            </div>
            <div class="url-actions">
              <el-tooltip content="複製短網址" placement="top">
                <el-button size="small" :icon="DocumentCopy" @click="copyUrl(url.shortUrl)" />
              </el-tooltip>
              <el-tooltip content="編輯" placement="top">
                <el-button size="small" :icon="Edit" @click="editUrl(url)" />
              </el-tooltip>
              <el-tooltip content="刪除" placement="top">
                <el-button size="small" type="danger" :icon="Delete" @click="deleteUrl(url)" />
              </el-tooltip>
            </div>
          </div>

          <div class="url-details">
            <div class="url-links">
              <div class="short-url">
                <label>短網址：</label>
                <el-link :href="url.shortUrl" target="_blank" type="primary" class="url-link">
                  {{ url.shortUrl }}
                  <el-icon><TopRight /></el-icon>
                </el-link>
              </div>

              <div class="original-url">
                <label>原始網址：</label>
                <span class="original-text">{{ truncateUrl(url.originalUrl) }}</span>
              </div>
            </div>

            <div class="url-stats">
              <div class="stat-item">
                <el-icon><View /></el-icon>
                <span>{{ url.clickCount }} 次點擊</span>
              </div>
              <div class="stat-item">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(url.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯對話框 -->
    <el-dialog v-model="showEditDialog" title="編輯短網址" width="400px" align-center>
      <el-form v-if="editingUrl" :model="editForm" label-width="80px">
        <el-form-item label="標題">
          <el-input
            v-model="editForm.title"
            placeholder="為短網址取個好記的名字"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditDialog = false"> 取消 </el-button>
          <el-button type="primary" :loading="updating" @click="handleUpdate"> 保存 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.recent-urls {
  width: 100%;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

.urls-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.url-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.url-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.url-content {
  padding: 16px;
}

.url-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.url-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.url-title h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.url-actions {
  display: flex;
  gap: 4px;
}

.url-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.url-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.short-url,
.original-url {
  display: flex;
  align-items: center;
  gap: 8px;
}

.short-url label,
.original-url label {
  min-width: 70px;
  color: #909399;
  font-size: 14px;
  font-weight: 500;
}

.url-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.original-text {
  color: #606266;
  font-size: 14px;
  word-break: break-all;
  line-height: 1.4;
}

.url-stats {
  display: flex;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .url-header {
    flex-direction: column;
    gap: 12px;
  }

  .url-title {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .url-actions {
    align-self: flex-end;
  }

  .short-url,
  .original-url {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .short-url label,
  .original-url label {
    min-width: auto;
  }

  .url-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
