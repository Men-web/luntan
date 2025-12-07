<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 页面标题和返回按钮 -->
        <div class="page-header">
          <h2>📝 我的帖子</h2>
          <div class="header-actions">
            <button 
              class="btn-filter" 
              :class="{ 'active': showRecommendedOnly }" 
              @click="toggleRecommendedFilter"
            >
              {{ showRecommendedOnly ? '全部帖子' : '仅看精选' }}
            </button>
            <button class="btn-back" @click="router.back()">
              ← 返回我的空间
            </button>
          </div>
        </div>

        <!-- 帖子列表 -->
        <section class="posts-section">
          <div v-if="isLoading" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <p class="error-message">{{ error }}</p>
          </div>

          <div v-else-if="userPosts.length === 0" class="empty-state">
            <p>你还没有发布任何帖子</p>
          </div>

          <div v-else class="posts-list">
            <div 
              v-for="post in filteredPosts" 
              :key="post.id"
              class="post-item"
              :class="{ 'recommended': post.is_recommended }"
            >
              <div class="post-header">
                <div class="post-meta">
                  <span class="category">{{ post.category }}</span>
                  <span class="date">{{ formatDate(post.created_at) }}</span>
                  <span v-if="post.is_recommended" class="recommended-badge">推荐</span>
                </div>
              </div>
              <div class="post-title">
                <h3>{{ post.title }}</h3>
              </div>
              <div class="post-actions">
                <button 
                  class="btn-view" 
                  @click="viewPost(post.id)"
                >
                  查看帖子
                </button>
                <button 
                  class="btn-delete" 
                  @click="confirmDeletePost(post.id)"
                >
                  删除帖子
                </button>
              </div>
            </div>
          </div>

          <!-- 二次确认对话框 -->
          <div v-if="showDeleteConfirm" class="modal-overlay">
            <div class="modal-content">
              <h3>确认删除</h3>
              <p>确定要删除这篇帖子吗？此操作不可撤销。</p>
              <div class="modal-actions">
                <button 
                  class="btn-cancel" 
                  @click="cancelDelete"
                >
                  取消
                </button>
                <button 
                  class="btn-confirm" 
                  @click="deletePost"
                  :disabled="isDeleting"
                >
                  {{ isDeleting ? '删除中...' : '确认删除' }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from './Navbar.vue';
import { useUserStore } from '../assets/stores';
import { get, post } from '../assets/http.js';

const router = useRouter();
const userStore = useUserStore();

// 状态管理
const userPosts = ref<any[]>([]);
const isLoading = ref(true);
const error = ref('');
const showRecommendedOnly = ref(false);

// 删除功能相关状态
const showDeleteConfirm = ref(false);
const postToDelete = ref<number | null>(null);
const isDeleting = ref(false);

// 筛选后的帖子
const filteredPosts = computed(() => {
  return showRecommendedOnly.value 
    ? userPosts.value.filter(post => post.is_recommended) 
    : userPosts.value;
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

// 加载用户帖子
const loadUserPosts = async () => {
  try {
    isLoading.value = true;
    error.value = '';
    
    // 调用API获取用户帖子信息，请求会自动带上session cookie
    const response = await get('/api/tiezi/get_user_posts_info/');
    
    if (response && response.success && Array.isArray(response.data)) {
      userPosts.value = response.data;
    } else {
      throw new Error('获取帖子信息失败');
    }
  } catch (err: any) {
    console.error('加载用户帖子失败:', err);
    error.value = err.message || '获取帖子信息失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

// 页面挂载时加载数据
onMounted(() => {
  loadUserPosts();
});

// 删除帖子相关方法
const confirmDeletePost = (postId: number) => {
  showDeleteConfirm.value = true;
  postToDelete.value = postId;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  postToDelete.value = null;
};

const deletePost = async () => {
  if (!postToDelete.value) return;
  
  try {
    isDeleting.value = true;
    const response = await post('/api/tiezi/delete_post/', { post_id: postToDelete.value });
    
    if (response.success) {
      // 从列表中移除已删除的帖子
      userPosts.value = userPosts.value.filter(post => post.id !== postToDelete.value);
      showDeleteConfirm.value = false;
      postToDelete.value = null;
      error.value = '';
    } else {
      throw new Error(response.message || '删除帖子失败');
    }
  } catch (err: any) {
    console.error('删除帖子错误:', err);
    error.value = err.message || '删除帖子失败，请稍后重试';
  } finally {
    isDeleting.value = false;
  }
};
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

.posts-section {
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

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-item.recommended {
  border-left: 4px solid #ffd700;
  background: #fff8e1;
}

.post-header {
  margin-bottom: 10px;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 14px;
  color: #666;
}

.category {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.recommended-badge {
  background: #ffd700;
  color: #8b4513;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
}

.post-title h3 {
  margin: 10px 0;
  font-size: 18px;
  color: #333;
  line-height: 1.5;
}

.post-actions {
  margin-top: 15px;
  text-align: right;
}

.btn-view {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 删除按钮样式 */
.btn-delete {
  padding: 8px 16px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #e64980;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.4);
}

/* 确认对话框样式 */
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