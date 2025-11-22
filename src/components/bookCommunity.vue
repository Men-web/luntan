<template>
  <div class="book-community">
    <!-- 导航栏 -->
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
      <div class="content-container">
        <h1>书籍社区</h1>
        
        <!-- 发帖功能已移除 -->

        <!-- 使用CommunityBase组件展示帖子 -->
        <CommunityBase 
          :title="'帖子列表'" 
          :communityType="'book'"
          @posts-loaded="handlePostsLoaded"
          @comment-submitted="handleCommentSubmitted"
          ref="communityBaseRef"
        />
      </div>
    </main>
  </div>
    <!-- 底部跳转按钮 -->
    <div class="jump-button-container">
      <button class="jump-button" @click="goToCreatePost">
        <span class="button-icon">📝</span>
        <span class="button-text">写帖子</span>
      </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';
import CommunityBase from './CommunityBase.vue';

const router = useRouter();
const userStore = useUserStore();
const communityBaseRef = ref<InstanceType<typeof CommunityBase> | null>(null);

// 跳转到登录页面
const goToLogin = () => {
  if (userStore.isLoggedIn) {
    alert('您已经登录了');
  } else {
    router.push('/login');
  }
};

// 处理退出登录
const handleLogout = async () => {
  try {
    const token = localStorage.getItem('token');
    // 调用后端退出登录接口
    await fetch(`${baseURL}/api/user/logout/`, {
      method: 'POST',
      credentials: 'omit', // 不发送凭证，避免触发登录重定向
      redirect: 'manual', // 手动处理重定向
      headers: {
        'Authorization': `Bearer ${token as string}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('退出登录请求失败:', error);
  } finally {
    // 无论后端请求是否成功，都清除本地存储和Pinia store
    localStorage.removeItem('token');
      localStorage.removeItem('username');
    // 清除Pinia store中的用户状态
    userStore.clearUserInfo();
    
    // 清除所有cookie
    document.cookie.split(';').forEach(cookie => {
      if (!cookie) return;
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=localhost;path=/';
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=127.0.0.1;path=/';
    });
    
    // 强制页面刷新以确保状态完全重置
    window.location.href = '/';
  }
};

// 跳转到创建帖子页面
const goToCreatePost = () => {
  router.push('/createPost');
};

// 处理帖子加载完成事件
const handlePostsLoaded = (posts: any[]) => {
  console.log('帖子加载完成:', posts);
};

// 处理评论提交事件
const handleCommentSubmitted = (postId: number, comment: string) => {
  console.log('评论提交成功:', { postId, comment });
};

// 组件挂载时确保登录状态正确同步
onMounted(() => {
  // 不再需要手动同步用户状态，由App.vue统一管理
  console.log('BookCommunity组件已加载');
});
</script>

<style scoped>
.book-community {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.header-nav {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.nav-container {
  max-width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
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
  color: #333;
  font-size: 14px;
  margin-right: 10px;
  white-space: nowrap;
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

.login-button:hover {
  background-color: #66b1ff;
}

.logout-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
}

.logout-button:hover {
  background-color: #d32f2f;
}

/* 主内容区域样式 */
.main-content {
  flex: 1;
  background-color: #f0f2f5;
  padding: 20px;
  overflow: auto;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

/* 底部跳转按钮样式 */
.jump-button-container {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 1000;
}

.jump-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
}

.jump-button:hover {
  background: linear-gradient(135deg, #66b1ff, #409eff);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.6);
}

.jump-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.6);
}

.button-icon {
  font-size: 18px;
}

.button-text {
  font-size: 14px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 6px 25px rgba(64, 158, 255, 0.6);
  }
  100% {
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
  }
}
</style>