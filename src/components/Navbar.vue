<template>
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
            <router-link to="/myselfCommunity" class="nav-link">生活树洞</router-link>
          </li>
          <li>
            <router-link to="/daliy_life" class="nav-link">我的空间</router-link>
          </li>
        </ul>
      </div>
      <div class="nav-right">
        <div class="user-status">
          {{ userStore.isLoggedIn ? `欢迎你，${userStore.username}` : '未登录' }}
        </div>
        <div class="auth-buttons" v-if="!userStore.isLoggedIn">
          <button class="login-button" @click="goToLogin">登录</button>
          <button class="register-button" @click="goToRegister">注册</button>
        </div>
        <button class="logout-button" @click="handleLogout" v-if="userStore.isLoggedIn">退出登录</button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';

const router = useRouter();
const userStore = useUserStore();

// 组件挂载时主动加载用户状态，确保登录/注册按钮显示逻辑一致
onMounted(() => {
  userStore.loadUserFromStorage();
});

// 跳转到登录页面
const goToLogin = () => {
  if (userStore.isLoggedIn) {
    alert('您已经登录了');
  } else {
    router.push('/login');
  }
};

// 跳转到注册页面
const goToRegister = () => {
  if (userStore.isLoggedIn) {
    alert('您已经登录了');
  } else {
    router.push('/register');
  }
};

// 处理退出登录
const handleLogout = async () => {
  try {
    // 调用后端退出登录接口，使用session cookie认证
    await fetch(`${baseURL}/api/user/logout/`, {
      method: 'POST',
      credentials: 'include', // 必须包含凭证，发送session cookie
      redirect: 'manual', // 手动处理重定向
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('退出登录请求失败:', error);
  } finally {
    // 无论后端请求是否成功，都清除本地存储和Pinia store
    localStorage.removeItem('username');
    // 清除Pinia store中的用户状态
    userStore.clearUserInfo();
    
    // 清除所有cookie（特别是session cookie）
    document.cookie.split(';').forEach(cookie => {
      if (!cookie) return;
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=localhost;path=/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=127.0.0.1;path=/';
    });
    
    // 强制页面完全刷新，确保所有组件状态重置
    window.location.href = '/';
  }
};
</script>

<style scoped>
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
  box-sizing: border-box;
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

.auth-buttons {
  display: flex;
  gap: 10px;
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
  white-space: nowrap;
  flex-shrink: 0;
}

.register-button {
  background-color: #67c23a;
  color: white;
  border: none;
  padding: 8px 20px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
}

.register-button:hover {
  background-color: #85ce61;
}

.register-button:active {
  background-color: #5daf34;
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
  white-space: nowrap;
  flex-shrink: 0;
}

.logout-button:hover {
  background-color: #f78989;
}

.logout-button:active {
  background-color: #dd6161;
}
</style>