<template>
  <div class="post-details-container">
    <header class="post-header">
      <h1 class="post-title">{{ post.title || '帖子加载中...' }}</h1>
      <div class="post-meta">
        <span class="post-category">分类: {{ post.category }}</span>
        <span class="post-author">作者: {{ post.author }}</span>
        <span class="post-date">{{ post.created_at }}</span>
      </div>
      <div class="post-stats">
        <span class="view-count">👁 {{ post.view_count }}</span>
        <span class="like-count">👍 {{ post.like_count }}</span>
        <span v-if="post.is_recommended" class="recommended-badge">推荐</span>
      </div>
    </header>

    <main class="post-content">
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="post-body">
        {{ post.content }}
      </div>
    </main>

    <div class="post-actions">
      <button class="back-button" @click="goBack">返回列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '../assets/url';

// 定义帖子数据类型
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
  like_count: number;
  view_count: number;
  is_recommended: boolean;
}

// 获取路由参数和路由实例
const route = useRoute();
const router = useRouter();

// 状态管理
const post = ref<Post>({
  id: 0,
  title: '',
  content: '',
  author: '',
  category: '',
  created_at: '',
  like_count: 0,
  view_count: 0,
  is_recommended: false
});
const isLoading = ref(true);
const error = ref('');

// 获取帖子详情
const fetchPostDetails = async () => {
  isLoading.value = true;
  error.value = '';
  
  try {
    const postId = route.params.postId;
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}/api/tiezi/detail/${postId}/`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('获取帖子详情失败');
    }
    
    const data = await response.json();
    
    if (data.success && data.post) {
      post.value = data.post;
    } else {
      throw new Error(data.message || '获取帖子详情失败');
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取帖子详情失败';
    console.error('获取帖子详情错误:', err);
  } finally {
    isLoading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 组件挂载时获取帖子详情
onMounted(() => {
  fetchPostDetails();
});
</script>

<style scoped>
.post-details-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  min-height: 100vh;
}

/* 帖子头部样式 */
.post-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e8e8e8;
}

.post-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
}

.post-stats {
  display: flex;
  gap: 15px;
  align-items: center;
  font-size: 16px;
}

.recommended-badge {
  background: #ff6b6b;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* 帖子内容样式 */
.post-content {
  margin-bottom: 40px;
}

.post-body {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 加载和错误状态 */
.loading, .error {
  text-align: center;
  padding: 60px 20px;
  font-size: 16px;
}

.error {
  color: #f56c6c;
}

/* 操作按钮 */
.post-actions {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.back-button {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #66b1ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-details-container {
    padding: 15px;
  }
  
  .post-title {
    font-size: 24px;
  }
  
  .post-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>