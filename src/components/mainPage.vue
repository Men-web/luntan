<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <header class="header-nav">
      <nav class="nav-container">
        <div class="nav-left">
          <ul class="nav-links">
            <li>
              <router-link to="/" class="nav-link">首页</router-link>
            </li>
            <li>
              <router-link to="/bookCommunity" class="nav-link">书籍</router-link>
            </li>
            <li>
              <router-link to="/movieCommunity" class="nav-link">电影</router-link>
            </li>
            <li>
              <router-link to="/daliy_life" class="nav-link">生活树洞</router-link>
            </li>
            <li>
              <router-link to="/myselfCommunity" class="nav-link">我的空间</router-link>
            </li>
          </ul>
        </div>
        <div class="nav-right">
          <div class="user-status">
            {{ userStore.isLoggedIn ? `欢迎你，${userStore.username}` : '未登录' }}
          </div>
          <button class="login-button" @click="goToLogin" v-if="!userStore.isLoggedIn">登录</button>
          <button class="logout-button" @click="handleLogout" v-if="userStore.isLoggedIn">退出登录</button>
        </div>
      </nav>
    </header>

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
import { useRouter } from 'vue-router';
import { onMounted, onBeforeUnmount, onUpdated } from 'vue';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';

const router = useRouter();
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

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login');
};

// 处理退出登录
const handleLogout = async () => {
  try {
    // 调用后端退出登录接口，添加Authorization头确保后端能识别当前会话
    const token = localStorage.getItem('token');
    await fetch(`${baseURL}/api/user/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token as string}` })
      }
    });
  } catch (error) {
    console.error('退出登录请求失败:', error);
  } finally {
    // 无论后端请求是否成功，都彻底清除本地登录状态
    // 清除localStorage中的所有相关数据
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    
    // 清除Pinia store中的用户状态
    userStore.clearUserInfo();
    
    // 改进的Cookie清理方式，确保在所有路径和域下都清除
    const cookies = document.cookie.split(';');
    const domain = window.location.hostname;
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      if (!cookie) continue; // 添加空值检查
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // 尝试多种方式清除cookie，确保全面覆盖
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`;
    }
    
    // 强制页面完全刷新，确保所有组件状态重置
    window.location.href = '/';
  }
};
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

/* 头部导航栏样式 */
.header-nav {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.nav-container {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-sizing: border-box; /* 确保padding不影响总宽度 */
}

.nav-left {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin-right: 30px;
}

/* 响应式导航链接间距 */
@media (max-width: 768px) {
  .nav-links li {
    margin-right: 15px;
  }
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  padding: 8px 0;
  transition: color 0.3s;
  position: relative;
}

.nav-link:hover {
  color: #409eff;
}

.nav-link.router-link-active {
  color: #409eff;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-status {
  color: #666;
  font-size: 14px;
  white-space: nowrap;
  margin-right: 10px;
}

.login-button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap; /* 防止文字换行 */
  flex-shrink: 0; /* 防止按钮在小屏幕上被压缩 */
}

.login-button:hover {
  background-color: #66b1ff;
}

.login-button:active {
  background-color: #3a8ee6;
}

.logout-button {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap; /* 防止文字换行 */
  flex-shrink: 0; /* 防止按钮在小屏幕上被压缩 */
}

.logout-button:hover {
  background-color: #f78989;
}

.logout-button:active {
  background-color: #dd6161;
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