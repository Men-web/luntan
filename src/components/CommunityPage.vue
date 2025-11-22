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
        <h1>{{ pageTitle }}</h1>
        <p v-if="pageDescription">{{ pageDescription }}</p>
        
        <!-- 特定类型内容展示 -->
        <div v-if="communityType === 'movie'" class="movie-showcase">
          <h3>热门电影推荐</h3>
          <div class="movie-list">
            <div class="movie-item" v-for="movie in movies" :key="movie.id">
              <div class="movie-title">{{ movie.title }}</div>
              <div class="movie-director">导演：{{ movie.director }}</div>
              <div class="movie-rating">评分：{{ movie.rating }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="communityType === 'daliy_life'" class="user-profile">
          <h3>个人功能</h3>
          <div class="feature-list">
            <div class="feature-item">
              <h4>我的收藏</h4>
              <p>管理您收藏的书籍和电影</p>
            </div>
            <div class="feature-item">
              <h4>个人资料</h4>
              <p>编辑您的个人信息</p>
            </div>
            <div class="feature-item">
              <h4>阅读记录</h4>
              <p>查看您的阅读和观影历史</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-container">
        <!-- 使用CommunityBase组件展示帖子 -->
        <CommunityBase 
          :title="postListTitle" 
          :communityType="communityType"
          @posts-loaded="handlePostsLoaded"
          @comment-submitted="handleCommentSubmitted"
          ref="communityBaseRef"
        />
      </div>
    </main>
    
    <!-- 底部跳转按钮 -->
    <div class="jump-button-container">
      <button class="jump-button" @click="goToCreatePost">
        <span class="button-icon">📝</span>
        <span class="button-text">写帖子</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';
import CommunityBase from './CommunityBase.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const communityBaseRef = ref<InstanceType<typeof CommunityBase> | null>(null);

// 根据路由参数确定社区类型
const communityType = computed(() => {
  const path = route.path;
  if (path.includes('book')) return 'book';
  if (path.includes('movie')) return 'movie';
  if (path.includes('daliy')) return 'daliy_life';
  return 'book'; // 默认显示书籍社区
});

// 动态页面标题
const pageTitle = computed(() => {
  switch (communityType.value) {
    case 'book': return '书籍社区';
    case 'movie': return '电影社区';
    case 'daliy_life': return '生活树洞';
    default: return '社区';
  }
});

// 动态页面描述
const pageDescription = computed(() => {
  switch (communityType.value) {
    case 'movie': return '欢迎来到电影社区，这里有最新电影资讯和影评交流。';
    case 'daliy_life': return '在这里分享您的日常生活点滴，记录心情感悟。';
    default: return '';
  }
});

// 帖子列表标题
const postListTitle = computed(() => {
  switch (communityType.value) {
    case 'book': return '帖子列表';
    case 'movie': return '电影讨论';
    case 'daliy_life': return '生活感悟';
    default: return '帖子列表';
  }
});

// 电影数据（模拟数据）
const movies = ref([
  { id: 1, title: '肖申克的救赎', director: '弗兰克·德拉邦特', rating: '9.7' },
  { id: 2, title: '霸王别姬', director: '陈凯歌', rating: '9.6' },
  { id: 3, title: '阿甘正传', director: '罗伯特·泽米吉斯', rating: '9.5' },
  { id: 4, title: '泰坦尼克号', director: '詹姆斯·卡梅隆', rating: '9.4' },
  { id: 5, title: '千与千寻', director: '宫崎骏', rating: '9.3' },
  { id: 6, title: '星际穿越', director: '克里斯托弗·诺兰', rating: '9.2' }
]);

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
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token as string}`
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
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }
};

// 跳转到创建帖子页面
const goToCreatePost = () => {
  router.push('/createPost');
};

// 处理帖子加载完成事件
const handlePostsLoaded = (posts: any[]) => {
  console.log(`${communityType.value} 社区帖子加载完成:`, posts);
};

// 处理评论提交事件
const handleCommentSubmitted = (postId: number, comment: string) => {
  console.log(`评论提交成功 - 帖子ID: ${postId}, 内容: ${comment}`);
};

// 组件挂载时同步用户状态
const syncUserStatus = () => {
  const storedUsername = localStorage.getItem('username');
  const storedToken = localStorage.getItem('token');
  
  // 确保本地状态与store完全同步
  if (storedUsername && storedToken) {
    userStore.setUsername(storedUsername);
  } else {
    userStore.clearUserInfo();
  }
};

onMounted(() => {
  // 不再需要手动同步用户状态，由App.vue统一管理
  console.log(`加载 ${communityType.value} 社区页面`);
  
  // 移除路由变化时的状态同步，避免与App.vue中的全局逻辑冲突
});

// 移除storage事件监听，避免与App.vue中的全局监听器冲突
// 状态同步和storage监听已在App.vue中统一处理
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

/* 头部导航栏样式 */
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

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto 30px;
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto 30px;
}

/* 电影展示区域样式 */
.movie-showcase {
  margin-top: 20px;
}

.movie-showcase h3 {
  margin-bottom: 15px;
  color: #333;
}

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.movie-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.movie-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.movie-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.movie-director {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.movie-rating {
  font-size: 14px;
  color: #ff6b35;
  font-weight: 500;
}

/* 个人功能区域样式 */
.user-profile {
  margin-top: 20px;
}

.user-profile h3 {
  margin-bottom: 15px;
  color: #333;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-item h4 {
  margin-bottom: 8px;
  color: #409eff;
}

.feature-item p {
  color: #666;
  font-size: 14px;
  margin: 0;
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
  background-color: #409eff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
}

.jump-button:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.5);
}

.jump-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-links li {
    margin-right: 15px;
  }
  
  .nav-link {
    font-size: 14px;
  }
  
  .movie-list {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style>