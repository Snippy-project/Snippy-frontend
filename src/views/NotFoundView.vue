<script setup>
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-content">
        <!-- 404 數字 -->
        <div class="error-code">
          <span class="four">4</span>
          <span class="zero">
            <el-icon size="120" color="#409EFF">
              <Search />
            </el-icon>
          </span>
          <span class="four">4</span>
        </div>

        <div class="error-info">
          <h1>頁面不存在</h1>
          <p>抱歉，您訪問的頁面可能已被刪除、重新命名或暫時不可用</p>
        </div>

        <div class="action-buttons">
          <el-button size="large" @click="goBack"> 返回上頁 </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.not-found-container {
  max-width: 600px;
  width: 100%;
}

.not-found-content {
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.error-code {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  font-size: 120px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
}

.error-code .four {
  text-shadow: 2px 2px 4px rgba(64, 158, 255, 0.3);
}

.error-code .zero {
  margin: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-info {
  margin-bottom: 40px;
}

.error-info h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
}

.error-info p {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 20px;
  }

  .error-code {
    font-size: 80px;
  }

  .error-code .zero {
    margin: 0 12px;
  }

  .error-code .zero .el-icon {
    font-size: 80px !important;
  }

  .error-info h1 {
    font-size: 24px;
  }
}
</style>
