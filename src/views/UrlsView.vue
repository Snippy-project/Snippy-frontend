<template>
  <div class="urls-page">
    <div class="urls-container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <div class="header-content">
          <h1>我的短網址</h1>
          <p>管理您創建的所有短網址</p>
        </div>
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          創建短網址
        </el-button>
      </div>

      <!-- 統計信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card">
            <el-statistic
              title="總短網址數"
              :value="pagination.totalCount"
              :value-style="{ color: '#409EFF' }"
            >
              <template #suffix>
                <el-icon><Link /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card">
            <el-statistic title="總點擊數" :value="totalClicks" :value-style="{ color: '#67C23A' }">
              <template #suffix>
                <el-icon><View /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-card class="stat-card">
            <el-statistic
              title="剩餘配額"
              :value="quota?.remaining || 0"
              :value-style="{ color: quota?.remaining <= 5 ? '#F56C6C' : '#409EFF' }"
            >
              <template #suffix>
                <el-icon><Coin /></el-icon>
              </template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <!-- 搜索和篩選 -->
      <el-card class="filter-card">
        <el-row :gutter="16" class="filter-row">
          <el-col :xs="24" :sm="16" :md="18">
            <el-input
              v-model="searchQuery"
              placeholder="搜索短網址標題或原始網址..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
              size="large"
            />
          </el-col>
          <el-col :xs="24" :sm="8" :md="6">
            <el-button @click="fetchUrls" :loading="loading" size="large" style="width: 100%">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 短網址列表 -->
      <el-card class="urls-card">
        <template #header>
          <div class="card-header">
            <span>短網址列表</span>
            <el-button
              v-if="selectedUrls.length > 0"
              type="danger"
              size="small"
              @click="batchDelete"
            >
              批量刪除 ({{ selectedUrls.length }})
            </el-button>
          </div>
        </template>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="urls.length === 0" class="empty-container">
          <el-empty description="沒有找到短網址">
            <el-button type="primary" @click="showCreateDialog = true">
              創建第一個短網址
            </el-button>
          </el-empty>
        </div>

        <div v-else class="urls-table">
          <!-- 批量選擇 -->
          <div class="batch-select">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="indeterminate"
              @change="handleSelectAll"
            >
              全選
            </el-checkbox>
          </div>

          <!-- 網址列表 -->
          <div class="urls-list">
            <div
              v-for="url in urls"
              :key="url.id"
              class="url-item"
              :class="{ selected: selectedUrls.includes(url.id) }"
            >
              <div class="url-checkbox">
                <el-checkbox
                  :model-value="selectedUrls.includes(url.id)"
                  @change="handleUrlSelect(url.id, $event)"
                />
              </div>

              <div class="url-content">
                <div class="url-header">
                  <div class="url-info">
                    <h3>{{ url.title || '無標題' }}</h3>
                    <div class="url-tags">
                      <el-tag v-if="url.customDomain" type="success" size="small">
                        {{ url.customDomain }}
                      </el-tag>
                      <el-tag :type="url.clickCount > 0 ? 'primary' : 'info'" size="small">
                        {{ url.clickCount }} 次點擊
                      </el-tag>
                    </div>
                  </div>

                  <div class="url-actions">
                    <el-button size="small" @click="copyUrl(url.shortUrl)" :icon="DocumentCopy">
                      複製
                    </el-button>
                    <el-button size="small" @click="editUrl(url)" :icon="Edit"> 編輯 </el-button>
                    <el-button size="small" type="danger" @click="deleteUrl(url)" :icon="Delete">
                      刪除
                    </el-button>
                  </div>
                </div>

                <div class="url-details">
                  <div class="url-row">
                    <span class="label">短網址：</span>
                    <el-link :href="url.shortUrl" target="_blank" type="primary" class="url-link">
                      {{ url.shortUrl }}
                      <el-icon><TopRight /></el-icon>
                    </el-link>
                  </div>

                  <div class="url-row">
                    <span class="label">原始網址：</span>
                    <span class="original-url">{{ truncateUrl(url.originalUrl, 60) }}</span>
                  </div>

                  <div class="url-meta">
                    <span class="meta-item">
                      <el-icon><Calendar /></el-icon>
                      {{ formatDate(url.createdAt) }}
                    </span>
                    <span v-if="url.expiresAt" class="meta-item">
                      <el-icon><Clock /></el-icon>
                      到期：{{ formatDate(url.expiresAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分頁 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20, 50]"
              :total="pagination.totalCount"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 創建短網址對話框 -->
    <CreateUrlDialog v-model="showCreateDialog" @created="handleUrlCreated" />

    <!-- 編輯對話框 -->
    <el-dialog v-model="showEditDialog" title="編輯短網址" width="500px" align-center>
      <el-form
        v-if="editingUrl"
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="標題" prop="title">
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

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import {
  Plus,
  Search,
  Refresh,
  Link,
  View,
  Coin,
  Calendar,
  Clock,
  DocumentCopy,
  Edit,
  Delete,
  TopRight,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce } from 'lodash-es'
import dayjs from 'dayjs'
import api from '@/services/api'
import CreateUrlDialog from '@/components/CreateUrlDialog.vue'

// 響應式數據
const loading = ref(false)
const urls = ref([])
const quota = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const totalClicks = ref(0)
const selectedUrls = ref([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingUrl = ref(null)
const updating = ref(false)
const editFormRef = ref()

// 分頁信息
const pagination = ref({
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  limit: 5,
})

// 編輯表單
const editForm = reactive({
  title: '',
})

const editRules = {
  title: [{ max: 100, message: '標題長度不能超過 100 個字符', trigger: 'blur' }],
}

// 計算屬性
const selectAll = computed({
  get: () => urls.value.length > 0 && selectedUrls.value.length === urls.value.length,
  set: (value) => {
    if (value) {
      selectedUrls.value = urls.value.map((url) => url.id)
    } else {
      selectedUrls.value = []
    }
  },
})

const indeterminate = computed(() => {
  return selectedUrls.value.length > 0 && selectedUrls.value.length < urls.value.length
})

// 取得短網址列表
const fetchUrls = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await api.get('/urls', { params })

    if (response.success) {
      urls.value = response.data
      pagination.value = response.pagination

      // 計算總點擊數
      totalClicks.value = urls.value.reduce((sum, url) => sum + url.clickCount, 0)
    }
  } catch (error) {
    console.error('取得短網址列表失敗:', error)
  } finally {
    loading.value = false
  }
}

// 取得配額信息
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

// 搜索處理（防抖）
const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchUrls()
}, 500)

// 分頁處理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchUrls()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchUrls()
}

// 選擇處理
const handleSelectAll = (value) => {
  selectAll.value = value
}

const handleUrlSelect = (urlId, selected) => {
  if (selected) {
    if (!selectedUrls.value.includes(urlId)) {
      selectedUrls.value.push(urlId)
    }
  } else {
    const index = selectedUrls.value.indexOf(urlId)
    if (index > -1) {
      selectedUrls.value.splice(index, 1)
    }
  }
}

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

  try {
    const valid = await editFormRef.value.validate()
    if (!valid) return

    updating.value = true

    const response = await api.put(`/urls/${editingUrl.value.id}`, {
      title: editForm.title,
    })

    if (response.success) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
      fetchUrls()
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
      fetchUrls()
      fetchQuota() // 刷新配額
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('刪除失敗:', error)
    }
  }
}

// 批量刪除
const batchDelete = async () => {
  if (selectedUrls.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      `確定要刪除選中的 ${selectedUrls.value.length} 個短網址嗎？`,
      '批量刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    // 串行刪除（避免並發問題）
    for (const urlId of selectedUrls.value) {
      await api.delete(`/urls/${urlId}`)
    }

    ElMessage.success('批量刪除成功')
    selectedUrls.value = []
    fetchUrls()
    fetchQuota()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量刪除失敗:', error)
    }
  }
}

// 處理短網址創建成功
const handleUrlCreated = () => {
  fetchUrls()
  fetchQuota()
}

// 截斷長網址
const truncateUrl = (url, maxLength = 50) => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 初始化
onMounted(() => {
  fetchUrls()
  fetchQuota()
})
</script>

<style scoped>
.urls-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.urls-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 28px;
  font-weight: 600;
}

.header-content p {
  margin: 0;
  color: #606266;
  font-size: 16px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-row {
  align-items: center;
}

.urls-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.batch-select {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.urls-list {
  display: flex;
  flex-direction: column;
}

.url-item {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.3s;
}

.url-item:hover {
  background-color: #f8f9fa;
}

.url-item.selected {
  background-color: #f0f9ff;
}

.url-checkbox {
  margin-right: 16px;
  padding-top: 4px;
}

.url-content {
  flex: 1;
}

.url-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.url-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.url-tags {
  display: flex;
  gap: 8px;
}

.url-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.url-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.url-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
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

.original-url {
  color: #606266;
  font-size: 14px;
  word-break: break-all;
  line-height: 1.4;
}

.url-meta {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .urls-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-content h1 {
    font-size: 24px;
  }

  .filter-row {
    flex-direction: column;
    gap: 12px;
  }

  .url-header {
    flex-direction: column;
    gap: 12px;
  }

  .url-actions {
    align-self: flex-end;
  }

  .url-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .label {
    min-width: auto;
  }

  .url-meta {
    flex-direction: column;
    gap: 8px;
  }

  .pagination-container {
    padding: 16px;
  }

  .url-item {
    flex-direction: column;
    gap: 12px;
  }

  .url-checkbox {
    margin-right: 0;
    align-self: flex-end;
  }
}
</style>
