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
        <h1>电影社区</h1>
        <p>欢迎来到电影社区，这里有最新电影资讯和影评交流。</p>
        <div class="movie-showcase">
          <h3>热门电影推荐</h3>
          <div class="movie-list">
            <div class="movie-item" v-for="movie in movies" :key="movie.id">
              <div class="movie-title">{{ movie.title }}</div>
              <div class="movie-director">导演：{{ movie.director }}</div>
              <div class="movie-rating">评分：{{ movie.rating }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';

const router = useRouter();
const userStore = useUserStore();

// 直接使用userStore管理登录状态

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

// 处理帖子加载完成事件
const handlePostsLoaded = (posts: any[]) => {
  console.log('电影帖子加载完成:', posts);
};

// 处理评论提交事件
const handleCommentSubmitted = (postId: number, comment: string) => {
  console.log('电影评论提交成功:', { postId, comment });
};

// 组件挂载时确保登录状态正确同步
onMounted(() => {
  // 不再需要手动同步用户状态，由App.vue统一管理
  console.log('MovieCommunity组件已加载');
});

// 模拟电影数据
const movies = [
  { id: 1, title: '肖申克的救赎', director: '弗兰克·德拉邦特', rating: '9.7' },
  { id: 2, title: '霸王别姬', director: '陈凯歌', rating: '9.6' },
  { id: 3, title: '阿甘正传', director: '罗伯特·泽米吉斯', rating: '9.5' },
  { id: 4, title: '泰坦尼克号', director: '詹姆斯·卡梅隆', rating: '9.4' },
  { id: 5, title: '千与千寻', director: '宫崎骏', rating: '9.3' },
  { id: 6, title: '星际穿越', director: '克里斯托弗·诺兰', rating: '9.2' }
];

// 跳转到创建帖子页面
const goToCreatePost = () => {
  router.push('/createPost');
};
</script>

<style scoped>
/* 应用主容器，确保全屏 */
.app-wrapper {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部导航栏样式 - 与mainPage保持一致 */
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

.login-button:active {
  background-color: #3a8ee6;
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
  margin: 0 auto 30px;
}

.content-wrapper h1 {
  color: #333;
  margin-bottom: 20px;
  font-size: 2.5em;
}

.content-wrapper p {
  color: #666;
  font-size: 1.2em;
  margin-bottom: 30px;
}

.movie-showcase {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.movie-showcase h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
  text-align: left;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.movie-item {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 20px;
  text-align: left;
  transition: transform 0.3s, box-shadow 0.3s;
}

.movie-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.movie-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.movie-director {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.movie-rating {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: 500;
}
</style>