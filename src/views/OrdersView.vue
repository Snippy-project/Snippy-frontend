<template>
  <div class="orders-page">
    <div class="orders-container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <div class="header-content">
          <h1>訂單記錄</h1>
          <p>查看您的購買記錄和付款狀態</p>
        </div>
        <el-button type="primary" @click="$router.push('/products')">
          <el-icon><ShoppingBag /></el-icon>
          購買方案
        </el-button>
      </div>

      <!-- 篩選器 -->
      <el-card class="filter-card">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8">
            <el-select
              v-model="statusFilter"
              placeholder="篩選狀態"
              clearable
              style="width: 100%"
              @change="fetchOrders"
            >
              <el-option label="全部狀態" value="" />
              <el-option label="待付款" value="pending" />
              <el-option label="已付款" value="paid" />
              <el-option label="付款失敗" value="failed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8">
            <el-button @click="fetchOrders" :loading="loading" style="width: 100%">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 訂單列表 -->
      <el-card class="orders-card">
        <template #header>
          <span>訂單列表</span>
        </template>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>

        <div v-else-if="orders.length === 0" class="empty-container">
          <el-empty description="還沒有任何訂單">
            <el-button type="primary" @click="$router.push('/products')"> 立即購買 </el-button>
          </el-empty>
        </div>

        <div v-else class="orders-list">
          <div
            v-for="order in orders"
            :key="order.id"
            class="order-item"
            @click="viewOrderDetail(order)"
          >
            <div class="order-content">
              <div class="order-header">
                <div class="order-info">
                  <h3>{{ order.productName }}</h3>
                  <p class="order-number">訂單編號：{{ order.orderNumber }}</p>
                </div>
                <div class="order-status">
                  <el-tag :type="getStatusType(order.orderStatus)" size="large">
                    {{ order.statusText }}
                  </el-tag>
                </div>
              </div>

              <div class="order-details">
                <div class="order-description">
                  {{ order.productDescription }}
                </div>

                <div class="order-meta">
                  <div class="meta-row">
                    <span class="label">金額：</span>
                    <span class="value price">{{ order.priceDisplay }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="label">創建時間：</span>
                    <span class="value">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <div v-if="order.paidAt" class="meta-row">
                    <span class="label">付款時間：</span>
                    <span class="value">{{ formatDate(order.paidAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="order-actions">
                <el-button
                  v-if="order.orderStatus === 'pending'"
                  type="primary"
                  @click.stop="payOrder(order)"
                >
                  立即付款
                </el-button>

                <el-button
                  v-if="process.env.NODE_ENV === 'development' && order.orderStatus === 'pending'"
                  type="success"
                  @click.stop="simulatePayment(order)"
                  :loading="simulating === order.id"
                >
                  模擬付款
                </el-button>

                <el-button @click.stop="viewOrderDetail(order)"> 查看詳情 </el-button>
              </div>
            </div>
          </div>

          <!-- 分頁 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 20]"
              :total="pagination.totalCount"
              layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 訂單詳情對話框 -->
    <el-dialog v-model="showDetailDialog" title="訂單詳情" width="500px" align-center>
      <div v-if="selectedOrder" class="order-detail">
        <div class="detail-section">
          <h4>基本資訊</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">訂單編號：</span>
              <span class="value">{{ selectedOrder.orderNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="label">商品名稱：</span>
              <span class="value">{{ selectedOrder.productName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">訂單狀態：</span>
              <el-tag :type="getStatusType(selectedOrder.orderStatus)">
                {{ selectedOrder.statusText }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="label">訂單金額：</span>
              <span class="value price">{{ selectedOrder.priceDisplay }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>時間記錄</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">創建時間：</span>
              <span class="value">{{ formatDateTime(selectedOrder.createdAt) }}</span>
            </div>
            <div v-if="selectedOrder.paidAt" class="detail-item">
              <span class="label">付款時間：</span>
              <span class="value">{{ formatDateTime(selectedOrder.paidAt) }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.ecpayTradeNo" class="detail-section">
          <h4>付款資訊</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">綠界交易編號：</span>
              <span class="value">{{ selectedOrder.ecpayTradeNo }}</span>
            </div>
            <div v-if="selectedOrder.ecpayPaymentDate" class="detail-item">
              <span class="label">綠界付款時間：</span>
              <span class="value">{{ formatDateTime(selectedOrder.ecpayPaymentDate) }}</span>
            </div>
          </div>
        </div>

        <div v-if="selectedOrder.failureReason" class="detail-section">
          <h4>失敗原因</h4>
          <el-alert :title="selectedOrder.failureReason" type="error" :closable="false" show-icon />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            v-if="selectedOrder?.orderStatus === 'pending'"
            type="primary"
            @click="payOrder(selectedOrder)"
          >
            立即付款
          </el-button>
          <el-button @click="showDetailDialog = false"> 關閉 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingBag, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import api from '@/services/api'

const router = useRouter()

// 響應式數據
const loading = ref(false)
const orders = ref([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailDialog = ref(false)
const selectedOrder = ref(null)
const simulating = ref(null)

// 分頁信息
const pagination = ref({
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  limit: 10,
})

// 取得訂單列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    }

    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const response = await api.get('/orders', { params })

    if (response.success) {
      orders.value = response.data
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('取得訂單列表失敗:', error)
  } finally {
    loading.value = false
  }
}

// 分頁處理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchOrders()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

// 付款
const payOrder = (order) => {
  const paymentUrl = `/api/orders/${order.id}/payment`
  window.open(paymentUrl, '_blank')
}

// 模擬付款（開發環境）
const simulatePayment = async (order) => {
  simulating.value = order.id
  try {
    const response = await api.post(`/orders/${order.id}/simulate-payment`)

    if (response.success) {
      ElMessage.success('模擬付款成功')
      fetchOrders() // 刷新列表
    }
  } catch (error) {
    console.error('模擬付款失敗:', error)
  } finally {
    simulating.value = null
  }
}

// 查看訂單詳情
const viewOrderDetail = async (order) => {
  try {
    const response = await api.get(`/orders/${order.id}`)

    if (response.success) {
      selectedOrder.value = response.data
      showDetailDialog.value = true
    }
  } catch (error) {
    console.error('取得訂單詳情失敗:', error)
  }
}

// 取得狀態類型
const getStatusType = (status) => {
  const statusTypes = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    cancelled: 'info',
  }
  return statusTypes[status] || 'info'
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const formatDateTime = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 初始化
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.orders-container {
  max-width: 1000px;
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

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.orders-card {
  border-radius: 8px;
}

.loading-container,
.empty-container {
  padding: 40px 20px;
  text-align: center;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.order-content {
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.order-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

.order-number {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.order-details {
  margin-bottom: 16px;
}

.order-description {
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-row .label {
  color: #909399;
  font-size: 14px;
  min-width: 80px;
}

.meta-row .value {
  color: #606266;
  font-size: 14px;
}

.meta-row .value.price {
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
}

.order-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
}

.pagination-container {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

.order-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #f0f2f5;
  padding-bottom: 8px;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-item .label {
  color: #909399;
  font-size: 14px;
  min-width: 100px;
  font-weight: 500;
}

.detail-item .value {
  color: #606266;
  font-size: 14px;
  flex: 1;
}

.detail-item .value.price {
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .orders-page {
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

  .order-header {
    flex-direction: column;
    gap: 12px;
  }

  .order-actions {
    flex-direction: column;
  }

  .order-actions .el-button {
    width: 100%;
  }

  .meta-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .meta-row .label {
    min-width: auto;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .detail-item .label {
    min-width: auto;
  }
}
</style>
