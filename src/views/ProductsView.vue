<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

// 響應式數據
const loading = ref(false)
const products = ref([])
const purchasing = ref(null)
const showConfirmDialog = ref(false)
const selectedProduct = ref(null)

// 取得商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await api.get('/products')
    if (response.success) {
      products.value = response.data
    }
  } catch (error) {
    console.error('取得商品列表失敗:', error)
  } finally {
    loading.value = false
  }
}

// 購買商品
const purchaseProduct = (product) => {
  selectedProduct.value = product
  showConfirmDialog.value = true
}

// 確認購買
const confirmPurchase = async () => {
  if (!selectedProduct.value) return

  purchasing.value = selectedProduct.value.id
  try {
    const response = await api.post('/orders', {
      productId: selectedProduct.value.id,
    })

    if (response.success) {
      ElMessage.success('訂單創建成功，即將跳轉至付款頁面')
      showConfirmDialog.value = false

      // 跳轉到付款頁面
      const paymentUrl = `/api/orders/${response.data.orderId}/payment`
      window.open(paymentUrl, '_blank')

      // 跳轉到訂單頁面
      setTimeout(() => {
        router.push('/orders')
      }, 1000)
    }
  } catch (error) {
    console.error('創建訂單失敗:', error)
  } finally {
    purchasing.value = null
  }
}

// 取得週期文字
const getPeriodText = (days) => {
  if (days === 30) return '月'
  if (days === 365) return '年'
  return `${days}天`
}

// 取得購買按鈕文字
const getPurchaseButtonText = (product) => {
  if (product.productType === 'quota') {
    return '立即購買'
  } else {
    return '開始訂閱'
  }
}

// 取得購買說明
const getPurchaseDescription = (product) => {
  if (product.productType === 'quota') {
    return `購買後將立即增加 ${product.quotaAmount} 個短網址配額，配額永久有效。`
  } else if (product.productType === 'custom_domain') {
    return '訂閱後可使用自訂域名功能，每月自動續費，可隨時取消。'
  } else if (product.productType === 'custom_domain_yearly') {
    return '訂閱後可使用自訂域名功能，年費方案更優惠，到期前可選擇續費。'
  }
  return ''
}

// 初始化
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="products-page">
    <div class="products-container">
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1>選擇方案</h1>
        <p>選擇最適合您需求的方案，立即開始使用短網址服務</p>
      </div>

      <!-- 方案卡片 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <el-card>
            <!-- 推薦標籤 -->
            <div
              v-if="product.productType === 'quota' && product.quotaAmount === 100"
              class="recommended-badge"
            >
              推薦
            </div>

            <!-- 卡片標題 -->
            <div class="product-header">
              <h3>{{ product.name }}</h3>
              <div class="product-price">
                <span class="price">{{ product.priceDisplay }}</span>
                <span v-if="product.subscriptionDurationDays" class="period">
                  / {{ getPeriodText(product.subscriptionDurationDays) }}
                </span>
              </div>
            </div>

            <!-- 商品描述 -->
            <div class="product-description">
              <p>{{ product.description }}</p>
            </div>

            <!-- 商品特色 -->
            <div class="product-features">
              <ul>
                <li v-for="feature in product.features" :key="feature">
                  <el-icon color="#67C23A"><Check /></el-icon>
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </div>

            <!-- 購買按鈕 -->
            <div class="product-footer">
              <el-button
                v-if="!authStore.isLoggedIn"
                type="primary"
                size="large"
                @click="$router.push('/login')"
                class="purchase-btn"
              >
                登入後購買
              </el-button>

              <el-button
                v-else
                type="primary"
                size="large"
                :loading="purchasing === product.id"
                @click="purchaseProduct(product)"
                class="purchase-btn"
              >
                {{ getPurchaseButtonText(product) }}
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 購買確認對話框 -->
    <el-dialog v-model="showConfirmDialog" title="確認購買" width="400px" align-center>
      <div v-if="selectedProduct" class="confirm-content">
        <div class="product-summary">
          <h4>{{ selectedProduct.name }}</h4>
          <p>{{ selectedProduct.description }}</p>
          <div class="price-summary">
            <span>金額：</span>
            <span class="price">{{ selectedProduct.priceDisplay }}</span>
          </div>
        </div>

        <el-alert
          title="購買說明"
          :description="getPurchaseDescription(selectedProduct)"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showConfirmDialog = false">取消</el-button>
          <el-button type="primary" :loading="purchasing" @click="confirmPurchase">
            確認購買
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.products-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-header h1 {
  font-size: 36px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 700;
}

.page-header p {
  font-size: 18px;
  color: #606266;
  margin: 0;
}

.loading-container {
  padding: 60px 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  position: relative;
}

.product-card:hover {
  transform: translateY(-4px);
  transition: transform 0.3s ease;
}

.recommended-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: #409eff;
  color: white;
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
}

.product-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.product-header h3 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.product-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price {
  font-size: 32px;
  color: #409eff;
  font-weight: 700;
}

.period {
  font-size: 16px;
  color: #909399;
}

.product-description {
  margin-bottom: 24px;
  text-align: center;
}

.product-description p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.product-features {
  margin-bottom: 32px;
}

.product-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.product-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #606266;
}

.purchase-btn {
  width: 100%;
}

.confirm-content {
  padding: 8px 0;
}

.product-summary h4 {
  color: #303133;
  font-size: 18px;
  margin: 0 0 8px 0;
}

.product-summary p {
  color: #606266;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.price-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #f0f2f5;
  font-size: 16px;
}

.price-summary .price {
  color: #409eff;
  font-weight: 600;
  font-size: 18px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .products-container {
    padding: 20px 16px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .page-header p {
    font-size: 16px;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .price {
    font-size: 28px;
  }
}
</style>
