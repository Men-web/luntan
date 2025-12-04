<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <h1>我的空间</h1>
        
        <!-- 使用CommunityBase组件展示帖子 -->
        <CommunityBase 
          :title="'我的帖子'" 
          :communityType="'myself'"
          @posts-loaded="handlePostsLoaded"
          @comment-submitted="handleCommentSubmitted"
          ref="communityBaseRef"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';
import Navbar from './Navbar.vue';

// 导入CommunityBase组件
import CommunityBase from './CommunityBase.vue';

// 为组件实例定义更简单的类型
type CommunityBaseInstance = any;

// 确保导入路径正确，如果CommunityBase组件位于不同目录，请调整路径
// 例如: import CommunityBase from '../components/CommunityBase.vue';

const router = useRouter();
const userStore = useUserStore();
const communityBaseRef = ref<CommunityBaseInstance | null>(null);

// 直接使用userStore管理登录状态

// 处理帖子加载完成事件
const handlePostsLoaded = (posts: any[]) => {
  console.log('我的帖子加载完成:', posts);
};

// 处理评论提交事件
const handleCommentSubmitted = (postId: number, comment: string) => {
  console.log('我的帖子评论提交成功:', { postId, comment });
};

// 组件挂载时确保登录状态正确同步
onMounted(() => {
  // 不再需要手动同步用户状态，由App.vue统一管理
  console.log('MyselfCommunity组件已加载');
});
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

.user-profile {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.user-profile h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5em;
  text-align: left;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.feature-item {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 20px;
  text-align: left;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-item h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 14px;
  color: #666;
  margin: 0;
}
</style>