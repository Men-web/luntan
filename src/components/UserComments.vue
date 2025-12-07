<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 页面标题和返回按钮 -->
        <div class="page-header">
          <h2>💬 我的评论</h2>
          <div class="header-actions">
            <button 
              class="btn-filter" 
              :class="{ 'active': showRecommendedOnly }" 
              @click="toggleRecommendedFilter"
            >
              {{ showRecommendedOnly ? '全部评论' : '仅看精选' }}
            </button>
            <button class="btn-back" @click="router.back()">
              ← 返回我的空间
            </button>
          </div>
        </div>

        <!-- 评论列表 -->
        <section class="comments-section">
          <div v-if="isLoading" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <p class="error-message">{{ error }}</p>
          </div>

          <div v-else-if="userComments.length === 0" class="empty-state">
            <p>你还没有发表任何评论</p>
          </div>

          <div v-else class="comments-list">
            <div 
              v-for="comment in filteredComments" 
              :key="comment.comment_id"
              class="comment-item"
              :class="{ 'recommended': comment.is_recommended }"
            >
              <div class="comment-header">
                <div class="comment-meta">
                  <span class="date">{{ formatDate(comment.comment_time) }}</span>
                  <span v-if="comment.is_recommended" class="recommended-badge">推荐</span>
                </div>
                <button 
                  class="btn-delete" 
                  @click="confirmDelete(comment.comment_id)"
                >
                  删除
                </button>
              </div>
              <div class="comment-content">
                <p>{{ comment.content }}</p>
              </div>
              <div class="comment-post">
                <span class="post-label">所属帖子：</span>
                <button 
                  class="post-title-btn" 
                  @click="viewPost(comment.post_id)"
                >
                  {{ comment.post_title }}
                </button>
              </div>
              <div v-if="comment.parent_comment_id" class="comment-parent">
                <span class="parent-label">回复评论：</span>
                <span class="parent-text">#{{ comment.parent_comment_id }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 删除确认对话框 -->
        <div v-if="showDeleteConfirm" class="modal-overlay">
          <div class="modal-content">
            <h3>确认删除</h3>
            <p>确定要删除这条评论吗？此操作不可撤销。</p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="cancelDelete">取消</button>
              <button class="btn-confirm" @click="deleteComment" :disabled="isDeleting">
                {{ isDeleting ? '删除中...' : '确认删除' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from './Navbar.vue';
import { get, post } from '../assets/http.js';

const router = useRouter();

// 状态管理
const userComments = ref<any[]>([]);
const isLoading = ref(true);
const error = ref('');
const showRecommendedOnly = ref(false);

// 删除相关状态
const showDeleteConfirm = ref(false);
const commentToDelete = ref<number | null>(null);
const isDeleting = ref(false);

// 筛选后的评论
const filteredComments = computed(() => {
  return showRecommendedOnly.value 
    ? userComments.value.filter(comment => comment.is_recommended) 
    : userComments.value;
});

// 切换筛选状态
const toggleRecommendedFilter = () => {
  showRecommendedOnly.value = !showRecommendedOnly.value;
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 查看帖子详情
const viewPost = (postId: number) => {
  router.push(`/post/${postId}`);
};

// 加载用户评论
const loadUserComments = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    // 调用API获取用户评论信息，请求会自动带上session cookie
    const response = await get('/api/tiezi/get_user_comments_info/');
    
    if (response && response.success && Array.isArray(response.data)) {
      userComments.value = response.data;
    } else {
      throw new Error('获取评论信息失败');
    }
  } catch (err: any) {
    console.error('加载用户评论失败:', err);
    error.value = err.message || '获取评论信息失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

// 确认删除
const confirmDelete = (commentId: number) => {
  showDeleteConfirm.value = true;
  commentToDelete.value = commentId;
};

// 取消删除
const cancelDelete = () => {
  showDeleteConfirm.value = false;
  commentToDelete.value = null;
};

// 删除评论
const deleteComment = async () => {
  if (!commentToDelete.value) return;
  
  try {
    isDeleting.value = true;
    const response = await post('/api/tiezi/delete_comment/', { comment_id: commentToDelete.value });
    
    if (response.success) {
      // 从本地评论列表中移除该评论
      userComments.value = userComments.value.filter(comment => comment.comment_id !== commentToDelete.value);
      // 隐藏确认对话框
      showDeleteConfirm.value = false;
      commentToDelete.value = null;
    } else {
      throw new Error(response.message || '删除评论失败');
    }
  } catch (err: any) {
    console.error('删除评论错误:', err);
    error.value = err.message || '删除评论失败，请稍后重试';
  } finally {
    isDeleting.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadUserComments();
});
</script>

<style scoped>
.app-wrapper {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-filter {
  padding: 10px 16px;
  background: #f0f2f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-filter:hover {
  background: #e4e6eb;
  border-color: #ccc;
}

.btn-filter.active {
  background: #ffd700;
  color: #8b4513;
  border-color: #ffd700;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-back {
  padding: 10px 20px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.comments-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loading-state, .empty-state, .error-state {
  text-align: center;
  padding: 40px;
}

.error-message {
  color: #e74c3c;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.comment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-item.recommended {
  border-left: 4px solid #ffd700;
  background: #fff8e1;
}

.comment-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.recommended-badge {
  background: #ffd700;
  color: #8b4513;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.comment-content {
  margin-bottom: 15px;
}

.comment-content p {
  margin: 0;
  line-height: 1.6;
  color: #333;
  font-size: 15px;
}

.comment-post {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-label {
  font-size: 14px;
  color: #666;
}

.post-title-btn {
  background: none;
  border: none;
  color: #1976d2;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.post-title-btn:hover {
  color: #1565c0;
  text-decoration: none;
}

.comment-parent {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #888;
}

.parent-label {
  font-style: italic;
}

.parent-text {
  color: #1976d2;
  font-weight: 500;
}

/* 删除按钮样式 */
.btn-delete {
  padding: 6px 12px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #e64980;
  transform: translateY(-1px);
}

/* 删除确认对话框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  margin-top: 0;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  padding: 8px 16px;
  background: #f0f2f5;
  color: #666;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #e4e6eb;
}

.btn-confirm {
  padding: 8px 16px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirm:hover:not(:disabled) {
  background: #e64980;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>