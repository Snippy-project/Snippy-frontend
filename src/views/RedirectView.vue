<script setup>
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'

const route = useRoute()
const error = ref('')

onMounted(() => {
  const shortId = route.params.shortId

  const backendUrl = `https://snippy-backend-aobc55625.zeabur.app/${shortId}`

  try {
    window.location.href = backendUrl
  } catch (err) {
    error.value = '短網址不存在或已失效'
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-xl font-bold">正在跳轉...</h1>
    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
  </div>
</template>
