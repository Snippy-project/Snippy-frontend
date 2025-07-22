import axios from 'axios'
import { ElMessage } from 'element-plus'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  withCredentials: true,
})

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    ElMessage.error('請求發送失敗')
    return Promise.reject(error)
  },
)

// 回應攔截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const { response } = error

    if (!response) {
      ElMessage.error('網路連線失敗')
      return Promise.reject(error)
    }

    const { status, data } = response

    switch (status) {
      case 401:
        ElMessage.error('請先登入')
        break
      case 403:
        ElMessage.error('權限不足')
        break
      case 404:
        ElMessage.error('資源不存在')
        break
      case 500:
        ElMessage.error('伺服器錯誤')
        break
      default:
        ElMessage.error(data?.message || '請求失敗')
    }

    return Promise.reject(error)
  },
)

export default api
