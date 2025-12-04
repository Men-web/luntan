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

    <!-- 评论部分 -->
    <section class="comments-section">
      <h2 class="comments-title">评论 ({{ comments.length }})</h2>
      <div v-if="isLoadingComments" class="loading">评论加载中...</div>
      <div v-else-if="comments.length === 0" class="no-comments">暂无评论</div>
      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-date">{{ comment.created_at }}</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          <div class="comment-actions-area">
            <div class="comment-stats">
              <span class="like-count">👍 {{ comment.like_count }}</span>
            </div>
            <button 
              v-if="isLoggedIn" 
              @click="toggleReplyForm(comment.id)" 
              class="reply-btn"
            >
              {{ showReplyForms[comment.id] ? '取消回复' : '回复' }}
            </button>
          </div>
          
          <!-- 回复表单 -->
          <div v-if="showReplyForms[comment.id]" class="reply-form">
            <textarea
              v-model="replyForms[comment.id]"
              placeholder="请输入回复内容"
              class="form-control"
              rows="2"
            ></textarea>
            <div class="comment-actions">
              <button 
                @click="cancelReply(comment.id)" 
                class="cancel-btn"
              >
                取消
              </button>
              <button 
                @click="submitReply(comment.id)" 
                class="comment-btn"
                :disabled="isSubmittingComment || !replyForms[comment.id]?.trim()"
              >
                {{ isSubmittingComment ? '回复中...' : '回复' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 发表评论表单 -->
      <div class="add-comment-section">
        <h3>发表评论</h3>
        <div v-if="!isLoggedIn" class="login-prompt">请先登录后再发表评论</div>
        <div v-else class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="请输入评论内容"
            class="form-control"
            rows="3"
          ></textarea>
          <div class="comment-actions">
            <button 
              @click="resetComment"
              class="cancel-btn"
            >
              取消
            </button>
            <button 
              @click="submitComment"
              class="comment-btn"
              :disabled="isSubmittingComment || !newComment?.trim()"
            >
              {{ isSubmittingComment ? '评论中...' : '发表评论' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';

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
  community_type?: string;
}

// 定义评论数据类型
interface Comment {
  id: number;
  author: string;
  content: string;
  created_at: string;
  like_count: number;
  parent_id?: number;
  replies?: Comment[];
}

// 获取路由参数和路由实例
const route = useRoute();
const router = useRouter();

// 使用用户store
const userStore = useUserStore();
const isLoggedIn = userStore.isLoggedIn;

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

// 评论状态管理
const comments = ref<Comment[]>([]);
const isLoadingComments = ref(false);
const newComment = ref('');
const isSubmittingComment = ref(false);

// 社区类型 - 从帖子数据中获取或默认设置
const communityType = ref<string>('movie'); // 默认值设为'movie'，后续会从帖子数据中更新

// 回复表单数据
const replyForms = reactive<Record<number, string>>({});
// 控制回复表单显示/隐藏的状态
const showReplyForms = reactive<Record<number, boolean>>({});

// 返回上一页
const goBack = () => {
  router.back();
};

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
      // 从帖子数据中获取社区类型
      if (data.post.community_type) {
        communityType.value = data.post.community_type;
      }
      // 获取评论
      await fetchComments();
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

// 获取评论
const fetchComments = async () => {
  isLoadingComments.value = true;
  
  try {
    const postId = post.value.id;
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}/api/posts/${postId}/comments/`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('获取评论失败');
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      comments.value = data;
    } else if (data.success && Array.isArray(data.comments)) {
      comments.value = data.comments;
    } else {
      comments.value = [];
    }
  } catch (err) {
    console.error('获取评论错误:', err);
    comments.value = [];
  } finally {
    isLoadingComments.value = false;
  }
};

// 发表评论
const submitComment = async () => {
  if (!newComment.value?.trim() || !userStore.isLoggedIn) {
    return;
  }
  
  isSubmittingComment.value = true;
  
  try {
    const postId = post.value.id;
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${baseURL}/api/posts/${postId}/comments/add/`, {
      method: 'POST',
      headers,
      credentials: 'include', // 发送凭证，确保用户身份正确识别
      body: JSON.stringify({ content: newComment.value.trim() })
    });
    
    if (!response.ok) {
      throw new Error('发表评论失败');
    }
    
    const data = await response.json();
    
    if (data.success || data.id) {
      // 清空评论表单
      newComment.value = '';
      // 重新获取评论列表
      await fetchComments();
    } else {
      throw new Error(data.message || '发表评论失败');
    }
  } catch (err) {
    console.error('发表评论错误:', err);
    error.value = '发表评论失败';
  } finally {
    isSubmittingComment.value = false;
  }
};

// 重置评论表单
const resetComment = () => {
  newComment.value = '';
};

// 切换回复表单
const toggleReplyForm = (commentId: number) => {
  showReplyForms[commentId] = !showReplyForms[commentId];
};

// 提交回复
const submitReply = async (parentId: number) => {
  if (!replyForms[parentId]?.trim() || !userStore.isLoggedIn) {
    return;
  }
  
  isSubmittingComment.value = true;
  
  try {
    const postId = post.value.id;
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await fetch(`${baseURL}/api/tiezi/${postId}/comments/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: replyForms[parentId].trim(),
        parent_id: parentId
      })
    });
    
    if (!response.ok) {
      throw new Error('发表回复失败');
    }
    
    const data = await response.json();
    
    if (data.success || data.id) {
      // 清空回复表单
      replyForms[parentId] = '';
      // 关闭回复表单
      showReplyForms[parentId] = false;
      // 重新获取评论列表
      await fetchComments();
    } else {
      throw new Error(data.message || '发表回复失败');
    }
  } catch (err) {
    console.error('发表回复错误:', err);
    error.value = '发表回复失败';
  } finally {
    isSubmittingComment.value = false;
  }
};

// 取消回复
const cancelReply = (commentId: number) => {
  showReplyForms[commentId] = false;
  replyForms[commentId] = '';
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