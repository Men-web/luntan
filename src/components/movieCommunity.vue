<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-wrapper">
        <h1>电影社区</h1>
        
        <!-- 使用CommunityBase组件展示帖子 -->
        <CommunityBase 
          :title="'帖子列表'" 
          :communityType="'movie'"
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
import { useUserStore } from '../assets/stores';
import Navbar from './Navbar.vue';
import CommunityBase from './CommunityBase.vue';

const router = useRouter();
const userStore = useUserStore();
const communityBaseRef = ref<InstanceType<typeof CommunityBase> | null>(null);

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