<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './assets/stores'

// 初始化用户store
const userStore = useUserStore()
const router = useRouter()

// 移除了focus事件监听，避免不必要的状态同步导致登录状态被清除

// 监听storage事件，确保不同标签页之间的状态同步
const handleStorageChange = (event: StorageEvent) => {
  // 只处理与用户状态相关的变化
  if (event.key === 'username' || event.key === 'token' || event.key === null) {
    // 同步localStorage和store状态
    userStore.syncUserStatus()
  }
}

// 在应用启动时确保用户状态正确加载
const initializeApp = () => {
  // 直接使用loadUserFromStorage加载状态，避免使用syncUserStatus可能带来的问题
  userStore.loadUserFromStorage()
  console.log('应用初始化完成，用户登录状态:', userStore.isLoggedIn)
}

// 组件挂载时
onMounted(() => {
  // 初始化应用
  initializeApp()
  
  // 仅保留storage事件监听，移除不必要的focus事件监听
  window.addEventListener('storage', handleStorageChange)
})

// 组件卸载时清理
onUnmounted(() => {
  // 只清理storage事件监听器
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<template>
  <div class="app-container">
    <!-- 路由视图，用于显示当前路由对应的组件 -->
    <router-view />
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  width: 100%;
  min-height: 100vh;
}
</style>
