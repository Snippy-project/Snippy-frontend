import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isVerified = computed(() => user.value?.isVerifiedEmail === true)

  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)

      if (response.success) {
        user.value = response.user
        ElMessage.success(response.message)
        return { success: true, redirectUrl: response.redirectUrl }
      }

      return { success: false, message: response.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登入失敗',
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    try {
      const response = await api.post('/auth/register', userData)

      if (response.success) {
        ElMessage.success(response.message)
        return { success: true, message: response.message }
      }

      return { success: false, message: response.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '註冊失敗',
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
      user.value = null
      ElMessage.success('登出成功')
    } catch (error) {
      user.value = null
      console.error('登出 API 失敗:', error)
    }
  }

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')

      if (response.success) {
        user.value = response.user
        return true
      }

      user.value = null
      return false
    } catch (error) {
      user.value = null
      return false
    }
  }

  const resendVerification = async (email) => {
    loading.value = true
    try {
      const response = await api.post('/auth/resend-verification', { email })

      if (response.success) {
        ElMessage.success(response.message)
        return { success: true }
      }

      return { success: false, message: response.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '發送失敗',
      }
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email) => {
    loading.value = true
    try {
      const response = await api.post('/auth/forgot-password', { email })

      if (response.success) {
        ElMessage.success(response.message)
        return { success: true }
      }

      return { success: false, message: response.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '發送失敗',
      }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,

    isLoggedIn,
    isVerified,

    login,
    register,
    logout,
    fetchUser,
    resendVerification,
    forgotPassword,
  }
})
