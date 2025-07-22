<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const authStore = useAuthStore()

const showNavbar = computed(() => {
  const hideNavbarRoutes = ['login', 'register', 'verify-email', 'reset-password']
  return !hideNavbarRoutes.includes(route.name)
})

onMounted(() => {
  authStore.fetchUser()
})
</script>

<template>
  <div id="app">
    <NavBar v-if="showNavbar" />

    <main :class="{ 'with-navbar': showNavbar }">
      <RouterView />
    </main>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background-color: #f5f7fa;
}

main {
  min-height: 100vh;
  transition: all 0.3s ease;
}

main.with-navbar {
  padding-top: 64px;
  min-height: calc(100vh - 64px);
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-button {
  border-radius: 6px;
}

.text-center {
  text-align: center;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.p-4 {
  padding: 1rem;
}
</style>
