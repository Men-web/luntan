<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />


    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-wrapper">
        <h1>欢迎来到千龙系统</h1>
        <p>这是系统的首页，请通过上方导航栏访问各个社区</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, onUpdated } from 'vue';
import { useUserStore } from '../assets/stores';
import Navbar from './Navbar.vue';

const userStore = useUserStore();

// 添加生命周期钩子调试
onMounted(() => {
  // 不再需要手动同步用户状态，由App.vue统一管理
  console.log('MainPage mounted - 登录前状态:', { username: userStore.username, isLoggedIn: userStore.isLoggedIn });
  
  // 立即检查localStorage中的值
  const storedUsername = localStorage.getItem('username');
  const storedToken = localStorage.getItem('token');
  console.log('MainPage mounted - localStorage状态:', { storedUsername, storedToken });
  
  // 确保内容区域可见
  setTimeout(() => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.style.display = 'flex';
      mainContent.style.visibility = 'visible';
    }
  }, 100);
});

onUpdated(() => {
  console.log('MainPage updated');
});

onBeforeUnmount(() => {
  console.log('MainPage before unmount');
});
</script>

<style scoped>
/* 应用主容器，确保全屏并适应缩放 */
.app-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  position: relative;
}

/* 确保页面内容始终可见 */
* {
  overflow: visible !important;
}



/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f2f5;
  overflow: auto;
}

.content-wrapper {
  text-align: center;
  padding: 40px;
  max-width: 90%; /* 限制最大宽度，防止在大屏幕上过度拉伸 */
  margin: 0 auto; /* 居中显示 */
}

.content-wrapper h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2.5em;
  word-break: break-word; /* 允许长单词在适当位置换行 */
}

.content-wrapper p {
  color: #666;
  font-size: 1.2em;
  word-break: break-word; /* 允许长单词在适当位置换行 */
}

/* 响应式内容区域 */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px;
  }
  
  .content-wrapper h1 {
    font-size: 2em;
  }
  
  .content-wrapper p {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: 15px;
  }
  
  .content-wrapper h1 {
    font-size: 1.8em;
  }
}
</style>