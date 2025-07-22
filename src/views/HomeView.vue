<script setup>
import { useAuthStore } from '@/stores/auth'
import { Lightning, Setting, Check, Link, Warning } from '@element-plus/icons-vue'

const authStore = useAuthStore()

const scrollToFeatures = () => {
  const element = document.getElementById('features')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              讓長網址變得
              <span class="highlight">簡潔有力</span>
            </h1>
            <p class="hero-description">
              專業的短網址服務，幫助您創建、管理和追蹤短網址。
              提升品牌形象，增強用戶體驗，讓分享變得更簡單。
            </p>
            <div class="hero-actions">
              <el-button
                v-if="!authStore.isLoggedIn"
                type="primary"
                size="large"
                @click="$router.push('/register')"
                class="cta-button"
              >
                免費開始使用
              </el-button>
              <el-button
                v-else
                type="primary"
                size="large"
                @click="$router.push('/dashboard')"
                class="cta-button"
              >
                前往儀表板
              </el-button>
              <el-button size="large" @click="scrollToFeatures" class="secondary-button">
                了解更多
              </el-button>
            </div>

            <div v-if="!authStore.isLoggedIn" class="register-prompt">
              <div class="prompt-box">
                <el-icon size="20" color="#E6A23C"><Warning /></el-icon>
                <span>需要註冊登入後才能使用短網址服務</span>
              </div>
              <p class="demo-hint">立即註冊，免費獲得 20 個短網址配額</p>
            </div>
          </div>

          <div class="hero-visual">
            <div class="url-demo">
              <div class="demo-card before">
                <div class="demo-label">原始網址</div>
                <div class="demo-url long">
                  https://www.example.com/very/long/path/with/many/parameters?id=12345&ref=social&utm_source=facebook
                </div>
              </div>

              <div class="demo-arrow">
                <el-icon size="32" color="#409EFF">
                  <ArrowDown />
                </el-icon>
              </div>

              <div class="demo-card after">
                <div class="demo-label">短網址</div>
                <div class="demo-url short">short.ly/abc123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section">
      <div class="features-container">
        <div class="section-header">
          <h2>為什麼選擇我們？</h2>
          <p>強大的功能，簡單的操作，專業的服務</p>
        </div>

        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="48" color="#409EFF">
                <Lightning />
              </el-icon>
            </div>
            <h3>極速創建</h3>
            <p>只需要幾秒鐘就能將長網址轉換為短網址，操作簡單直觀。</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="48" color="#F56C6C"> </el-icon>
            </div>
            <h3>自訂域名</h3>
            <p>使用您自己的域名，提升品牌形象和用戶信任度。</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon size="48" color="#909399">
                <Setting />
              </el-icon>
            </div>
            <h3>網址管理</h3>
            <p>支援網址創建、編輯和刪除。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="pricing-section">
      <div class="pricing-container">
        <div class="section-header">
          <h2>選擇適合的方案</h2>
          <p>靈活的定價，滿足不同需求</p>
        </div>

        <div class="pricing-grid">
          <div class="pricing-card free">
            <div class="plan-header">
              <h3>免費方案</h3>
              <div class="plan-price">
                <span class="price">免費</span>
              </div>
            </div>
            <ul class="plan-features">
              <li>
                <el-icon><Check /></el-icon>20 個短網址配額
              </li>
              <li>
                <el-icon><Check /></el-icon>基本統計功能
              </li>
              <li>
                <el-icon><Check /></el-icon>永久有效
              </li>
              <li>
                <el-icon><Check /></el-icon>技術支援
              </li>
            </ul>
            <el-button
              v-if="!authStore.isLoggedIn"
              type="primary"
              size="large"
              @click="$router.push('/register')"
              style="width: 100%"
            >
              立即註冊
            </el-button>
            <el-button v-else size="large" @click="$router.push('/dashboard')" style="width: 100%">
              開始使用
            </el-button>
          </div>

          <div class="pricing-card pro recommended">
            <div class="recommended-badge">推薦</div>
            <div class="plan-header">
              <h3>專業方案</h3>
              <div class="plan-price">
                <span class="price">$9.99</span>
                <span class="period">/ 年</span>
              </div>
            </div>
            <ul class="plan-features">
              <li>
                <el-icon><Check /></el-icon>自訂域名功能
              </li>
              <li>
                <el-icon><Check /></el-icon>無限短網址
              </li>
              <li>
                <el-icon><Check /></el-icon>進階統計分析
              </li>
              <li>
                <el-icon><Check /></el-icon>優先技術支援
              </li>
            </ul>
            <el-button
              type="primary"
              size="large"
              @click="$router.push('/products')"
              style="width: 100%"
            >
              選擇方案
            </el-button>
          </div>

          <div class="pricing-card addon">
            <div class="plan-header">
              <h3>配額加購</h3>
              <div class="plan-price">
                <span class="price">$0.90</span>
                <span class="period">/ 100個</span>
              </div>
            </div>
            <ul class="plan-features">
              <li>
                <el-icon><Check /></el-icon>100 個額外配額
              </li>
              <li>
                <el-icon><Check /></el-icon>永久有效
              </li>
              <li>
                <el-icon><Check /></el-icon>隨時購買
              </li>
              <li>
                <el-icon><Check /></el-icon>即時生效
              </li>
            </ul>
            <el-button
              type="primary"
              size="large"
              @click="$router.push('/products')"
              style="width: 100%"
            >
              選擇方案
            </el-button>
          </div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="brand">
              <el-icon size="28" color="#409EFF">
                <Link />
              </el-icon>
              <span class="brand-name">Snippy</span>
            </div>
          </div>

          <div class="footer-links">
            <div class="link-group">
              <h4>產品</h4>
              <ul>
                <li><a href="/products">方案價格</a></li>
                <li><a href="/register">免費註冊</a></li>
              </ul>
            </div>

            <div class="link-group">
              <h4>支援</h4>
              <ul>
                <li><a href="#">聯絡我們</a></li>
                <li><a href="#">API 文檔</a></li>
              </ul>
            </div>

            <div class="link-group">
              <h4>法律</h4>
              <ul>
                <li><a href="#">服務條款</a></li>
                <li><a href="#">Cookie 政策</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2025 Snippy. 版權所有.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  overflow-x: hidden;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 60vh;
  display: flex;
  align-items: center;
  color: white;
  position: relative;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  width: 100%;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
}

.hero-visual {
  display: flex;
  justify-content: center;
}

.url-demo {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.demo-card {
  background: white;
  color: #303133;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.demo-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.demo-url {
  font-family: 'Monaco', 'Consolas', monospace;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.demo-url.long {
  background: #fef2f2;
  color: #dc2626;
  word-break: break-all;
  font-size: 14px;
}

.demo-url.short {
  background: #f0f9ff;
  color: #2563eb;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.highlight {
  background: linear-gradient(45deg, #ffd700, #ffa500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.demo-arrow {
  animation: bounce 2s infinite;
}

.cta-button {
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 8px;
  font-weight: 600;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 8px;
  font-weight: 600;
}

.secondary-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.register-prompt {
  max-width: 500px;
}

.prompt-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(230, 162, 60, 0.3);
  border-radius: 12px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
}

.demo-hint {
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
}

.features-section {
  padding: 100px 0;
  background: #f8fafc;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 80px;
}

.section-header h2 {
  font-size: 36px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
}

.section-header p {
  font-size: 18px;
  color: #606266;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.feature-item {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-8px);
}

.feature-icon {
  margin-bottom: 24px;
}

.feature-item h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
}

.feature-item p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.pricing-section {
  padding: 100px 0;
  background: white;
}

.pricing-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 60px;
}

.pricing-card {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  transition: all 0.3s ease;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.pricing-card.recommended {
  border-color: #409eff;
  box-shadow: 0 8px 30px rgba(64, 158, 255, 0.15);
}

.recommended-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #409eff;
  color: white;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.plan-header {
  margin-bottom: 30px;
}

.plan-header h3 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 16px;
  font-weight: 600;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.price {
  font-size: 36px;
  color: #409eff;
  font-weight: 700;
}

.period {
  font-size: 16px;
  color: #909399;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 40px 0;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: #606266;
}

.footer {
  background: #1f2937;
  color: white;
  padding: 60px 0 20px 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
  margin-bottom: 40px;
}

.footer-brand .brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.footer-brand p {
  color: #9ca3af;
  margin: 0;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.link-group h4 {
  color: white;
  margin-bottom: 20px;
  font-weight: 600;
}

.link-group ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-group li {
  margin-bottom: 12px;
}

.link-group a {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s;
}

.link-group a:hover {
  color: #409eff;
}

.footer-bottom {
  padding-top: 20px;
  border-top: 1px solid #374151;
  text-align: center;
}

.footer-bottom p {
  color: #9ca3af;
  margin: 0;
}

/* 響應式設計 - 只保留 768px 斷點 */
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0;
    min-height: auto;
  }

  .hero-container {
    padding: 0 16px;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-description {
    font-size: 18px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 12px;
  }

  .cta-button,
  .secondary-button {
    width: 100%;
  }

  .features-section,
  .pricing-section {
    padding: 60px 0;
  }

  .section-header h2 {
    font-size: 28px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feature-item {
    padding: 30px 20px;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .pricing-card {
    padding: 30px 20px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }

  .url-demo {
    width: 100%;
  }

  .demo-card {
    max-width: 100%;
  }
}

/* 滾動行為優化 */
html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
