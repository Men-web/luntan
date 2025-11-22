<template>
  <div class="community-base">
    <!-- 消息通知组件 -->
    <div 
      v-if="showMessage" 
      :class="['notification-message', `notification-${messageType}`]"
    >
      {{ message }}
    </div>
    
    <!-- 帖子列表 -->
    <div class="posts-container">
      <h2>{{ title || '帖子列表' }}</h2>
      <div v-if="isLoadingPosts" class="loading">加载中...</div>
      <div v-else-if="posts.length === 0" class="no-posts">暂无帖子</div>
      <div v-else class="posts-list">
        <div v-for="post in posts" :key="post.id" :class="['post-item', { 'recommended-post': post.is_recommended }]">
          <div class="post-header">
            <h3 class="post-title" @click="goToPostDetail(post.id)" style="cursor: pointer;">
              {{ post.title }}
            </h3>
            <span v-if="post.is_recommended" class="recommended-badge">推荐</span>
          </div>
          <div class="post-meta">
            <span class="post-category">分类: {{ post.category }}</span>
            <span class="post-author">作者: {{ post.author }}</span>
            <span class="post-date">{{ post.created_at }}</span>
          </div>
          <p class="post-content">{{ post.content }}</p>
          <div class="post-stats">
            <span class="like-count">👍 {{ post.like_count }}</span>
            <span class="view-count">👁 {{ post.view_count }}</span>
          </div>
          <div class="post-comments">
            <h4>评论 ({{ post.comments.length }})</h4>
            <div v-if="post.comments.length === 0" class="no-comments">暂无评论</div>
            <div v-else class="comments-list">
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-date">{{ comment.created_at }}</span>
                  <span v-if="comment.is_featured" class="featured">精选</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
                <div class="comment-actions-area">
                  <div class="comment-stats">
                    <span class="like-count">👍 {{ comment.like_count }}</span>
                  </div>
                  <button 
                    v-if="userStore.isLoggedIn" 
                    @click="toggleReplyForm(post.id, comment.id)" 
                    class="reply-btn"
                  >
                    {{ showReplyForms[`${post.id}-${comment.id}`] ? '取消回复' : '回复' }}
                  </button>
                </div>
                
                <!-- 回复表单 -->
                <div v-if="showReplyForms[`${post.id}-${comment.id}`]" class="reply-form">
                  <textarea
                    v-model="replyForms[`${post.id}-${comment.id}`]"
                    placeholder="请输入回复内容"
                    class="form-control"
                    rows="2"
                  ></textarea>
                  <div class="comment-actions">
                    <button 
                      @click="cancelReply(post.id, comment.id)" 
                      class="cancel-btn"
                    >
                      取消
                    </button>
                    <button 
                      @click="submitReply(post.id, comment.id)" 
                      class="comment-btn"
                      :disabled="isSubmittingComment || !userStore.isLoggedIn || !replyForms[`${post.id}-${comment.id}`]?.trim()"
                    >
                      {{ isSubmittingComment ? '回复中...' : '回复' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 评论表单区域 -->
            <div class="comment-form-area">
              <!-- 添加评论按钮 -->
              <button 
                v-if="!showCommentForms[post.id]" 
                @click="showCommentForms[post.id] = true" 
                class="add-comment-btn"
                :disabled="!userStore.isLoggedIn"
              >
                添加评论
              </button>
              
              <!-- 评论表单 -->
              <div v-else class="comment-form">
                <textarea
                  v-model="commentForms[post.id]"
                  placeholder="请输入评论内容"
                  class="form-control"
                  rows="3"
                  ref="commentTextarea"
                ></textarea>
                <div class="comment-actions">
                  <button 
                    @click="showCommentForms[post.id] = false; commentForms[post.id] = ''" 
                    class="cancel-btn"
                  >
                    取消
                  </button>
                  <button 
                    @click="submitComment(post.id)" 
                    class="comment-btn"
                    :disabled="isSubmittingComment || !userStore.isLoggedIn || !commentForms[post.id]?.trim()"
                  >
                    {{ isSubmittingComment ? '评论中...' : '发表评论' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';

// 定义组件属性
const props = defineProps<{
  title?: string;
  communityType?: string;
}>();

// 定义事件
const emit = defineEmits<{
  'posts-loaded': [posts: any[]];
  'comment-submitted': [postId: number, comment: string];
}>();

// 使用用户store
const userStore = useUserStore();
// 获取路由实例
const router = useRouter();

// 评论表单数据
const commentForms = reactive<Record<number, string>>({});
// 回复表单数据
const replyForms = reactive<Record<string, string>>({});

// 控制评论表单显示/隐藏的状态
const showCommentForms = reactive<Record<number, boolean>>({});
// 控制回复表单显示/隐藏的状态
const showReplyForms = reactive<Record<string, boolean>>({});

// 状态变量
const isSubmittingComment = ref(false);
const isLoadingPosts = ref(true);
const posts = ref<any[]>([]);

// 消息提示状态
const message = ref('');
const messageType = ref<'success' | 'error' | 'info'>('info');
const showMessage = ref(false);

// 验证token有效性的函数
const verifyToken = async () => {
  const storedToken = localStorage.getItem('token');
  if (!storedToken) return;
  
  try {
    const response = await fetch(`${baseURL}/api/user/verify/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${storedToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'omit',
      redirect: 'manual'
    });
    
    if (!response.ok) {
      // 只清除无效的token，但保留用户名
      // 这符合stores.ts中的逻辑：只要有username就认为用户已登录
      console.log('Token验证失败，清除无效token但保留用户登录状态');
      localStorage.removeItem('token'); // 只清除无效的token
      
      // 即使在生产环境中，也不清除用户名，保持与stores.ts一致的登录判断逻辑
      // 这样可以确保后端认为登录正常时，前端也显示为已登录状态
    }
  } catch (error) {
    console.error('验证token时发生错误:', error);
    // 错误时不自动清除状态，避免影响用户体验
  }
};

// 跳转到帖子详情页面
const goToPostDetail = (postId: number) => {
  router.push(`/post/${postId}`);
};

// 提交评论或回复
const submitComment = async (postId: number, parentId?: number) => {
  isSubmittingComment.value = true;
  
  try {
    // 获取存储的token
    const token = localStorage.getItem('token');
    
    // 检查登录状态 - 遵循stores.ts中的isLoggedIn逻辑，只要有username就认为已登录
    const hasUsername = !!localStorage.getItem('username');
    
    if (!hasUsername) {
      // 只有当用户名不存在时，才提示用户登录
      showNotification('请先登录后再发表评论', 'error');
      isSubmittingComment.value = false;
      return;
    }
    
    // token缺失但用户名存在的情况下，不清除用户状态
    // 而是尝试使用现有的登录状态继续操作
    // 根据stores.ts中的实现，只要有username就应认为用户已登录
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // 确保添加token认证
    }
    
    // 根据是否有父评论ID决定使用哪个表单数据
    let content = '';
    if (parentId) {
      const replyKey = `${postId}-${parentId}`;
      content = replyForms[replyKey]?.trim() || '';
    } else {
      content = commentForms[postId]?.trim() || '';
    }
    
    // 验证内容是否为空
    if (!content) {
      showNotification('评论内容不能为空', 'error');
      isSubmittingComment.value = false;
      return;
    }
    
    // 构建请求数据
    const requestData: Record<string, any> = {
      content
    };
    
    // 如果提供了父评论ID，添加到请求数据中
    if (parentId) {
      requestData.parent_id = parentId;
    }
    
    // 使用正确的API路径，与后端保持一致
    const response = await fetch(`${baseURL}/posts/${postId}/comments/`, {
      method: 'POST',
      headers,
      credentials: 'omit', // 不发送凭证，避免触发登录重定向
      redirect: 'manual', // 手动处理重定向，不自动跟随
      body: JSON.stringify(requestData)
    });
    
    // 处理不同类型的响应状态
    if (response.status === 302) {
      // 处理302重定向 - 可能是认证问题
      showNotification('登录已过期，请重新登录', 'error');
      // 只清除可能失效的token，但保留用户名和登录状态
        localStorage.removeItem('token');
      // 不清除用户登录状态，保持与stores.ts一致的登录判断逻辑
      isSubmittingComment.value = false;
      return;
    } else if (!response.ok) {
      // 处理其他HTTP错误
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `评论提交失败 (HTTP ${response.status})`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '评论失败，请重试');
    }
    
    // 清空相应的表单
    if (parentId) {
      const replyKey = `${postId}-${parentId}`;
      replyForms[replyKey] = '';
      // 关闭回复表单
      showReplyForms[replyKey] = false;
    } else {
      commentForms[postId] = '';
      // 关闭评论表单
      showCommentForms[postId] = false;
    }
    
    // 触发评论提交事件
    emit('comment-submitted', postId, content);
    
    // 刷新帖子列表以显示新评论
    fetchPosts();
    
    // 显示成功消息
    showNotification(result.message || '评论提交成功', 'success');
  } catch (error: any) {
    console.error('评论错误:', error.message || error);
    // 显示错误消息
    showNotification(error.message || '评论失败，请稍后重试', 'error');
  } finally {
    isSubmittingComment.value = false;
  }
};

// 获取帖子列表
const fetchPosts = async () => {
      isLoadingPosts.value = true;
      
      try {
        // 获取存储的token
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        // 如果有token，添加到请求头
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        // 根据communityType决定API路径
        let apiPath = '/api/tiezi/';
        if (props.communityType) {
          apiPath = `/api/tiezi/${props.communityType}/`;
        }
        
        // 添加redirect: 'manual'选项，防止自动跟随重定向到不存在的登录页面
        const response = await fetch(`${baseURL}${apiPath}`, {
          method: 'GET',
          headers,
          credentials: 'omit', // 不发送凭证，避免触发登录重定向
          redirect: 'manual' // 手动处理重定向，不自动跟随
        });
        
        // 处理302重定向响应
        if (response.status === 302) {
          // 不跟随重定向到不存在的登录页面
          // 直接尝试使用GET请求获取帖子数据，不涉及认证
          showNotification('尝试获取公开帖子数据', 'info');
          const publicResponse = await fetch(`${baseURL}${apiPath}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'omit', // 确保不发送凭证
            redirect: 'manual' // 同样设置为手动处理重定向
          });
          
          // 检查第二个请求是否也返回302
          if (publicResponse.status === 302) {
            // 如果第二个请求也返回302，说明无法获取数据
            showNotification('当前无法获取公开帖子数据，请稍后重试', 'error');
            posts.value = [];
          } else if (publicResponse.ok) {
            const data = await publicResponse.json();
            // 确保数据结构正确，从success和posts字段获取数据
            if (data.success && Array.isArray(data.posts)) {
              // 为每个帖子添加空comments数组，确保模板正常显示
              posts.value = data.posts.map((post: any) => ({
                ...post,
                comments: []
              }));
            } else {
              posts.value = [];
            }
          } else {
            // 如果是其他错误状态码，给出提示但不抛出异常，避免重复请求
            showNotification(`获取帖子列表失败: ${publicResponse.status}`, 'error');
            posts.value = [];
          }
        } else if (response.ok) {
          const data = await response.json();
          // 确保数据结构正确，从success和posts字段获取数据
          if (data.success && Array.isArray(data.posts)) {
            // 为每个帖子添加空comments数组，确保模板正常显示
            posts.value = data.posts.map((post: any) => ({
              ...post,
              comments: []
            }));
          } else {
            posts.value = [];
          }
        } else {
          throw new Error('获取帖子列表失败');
        }
        
        // 触发帖子加载完成事件
        emit('posts-loaded', posts.value);
      } catch (error) {
        console.error('获取帖子列表错误:', error);
      } finally {
        isLoadingPosts.value = false;
      }
    };

// 切换回复表单的显示状态
const toggleReplyForm = (postId: number, commentId: number) => {
  // 确保只有登录用户可以回复
  if (!userStore.isLoggedIn) {
    showNotification('请先登录后再回复', 'error');
    return;
  }
  const key = `${postId}-${commentId}`;
  showReplyForms[key] = !showReplyForms[key];
  
  // 如果显示回复表单，隐藏主评论表单
  if (showReplyForms[key]) {
    showCommentForms[postId] = false;
  }
};


// 显示通知消息
const showNotification = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  message.value = msg;
  messageType.value = type;
  showMessage.value = true;
  
  // 3秒后自动隐藏消息
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

// 提供给父组件的方法
defineExpose({
  fetchPosts,
  posts
});

// 监听communityType变化，重新获取帖子
watch(() => props.communityType, () => {
  fetchPosts();
});

// 取消回复
const cancelReply = (postId: number, commentId: number) => {
  const key = `${postId}-${commentId}`;
  showReplyForms[key] = false;
  replyForms[key] = '';
};

// 提交回复
const submitReply = async (postId: number, commentId: number) => {
  const key = `${postId}-${commentId}`;
  
  if (!replyForms[key]?.trim() || !userStore.isLoggedIn) {
    return;
  }
  
  // 使用submitComment方法提交回复，传递父评论ID
  await submitComment(postId, commentId);
  
  // 取消回复状态
  cancelReply(postId, commentId);
};

// 合并组件挂载时的所有初始化逻辑
onMounted(() => {
  // 不再需要手动同步用户状态，由App.vue统一管理
  
  // 获取帖子列表
  fetchPosts();
  
  // 移除storage事件监听器，避免与App.vue中的监听器冲突
  // 监听器已在App.vue中全局设置
  
  console.log('CommunityBase组件挂载');
});
</script>

<style scoped>
.community-base {
  width: 100%;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 帖子列表样式 */
.posts-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.posts-container h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 10px;
}

.loading, .no-posts {
  text-align: center;
  padding: 40px;
  color: #666;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  background: white;
}

.post-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 推荐帖子样式 */
.recommended-post {
  border-color: #ff6b6b;
  background: #fff5f5;
  position: relative;
  overflow: hidden;
}

.recommended-post::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #ff6b6b, #ff8e8e);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.post-title {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

/* 推荐徽章样式 */
.recommended-badge {
  background: #ff6b6b;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
  flex-shrink: 0;
}

.post-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  flex-wrap: wrap;
}

.post-content {
  margin-bottom: 10px;
  color: #333;
  line-height: 1.5;
  word-break: break-word;
}

.post-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  align-items: center;
}

.recommended {
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

/* 评论样式 */
.post-comments {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.post-comments h4 {
  margin-bottom: 10px;
  color: #333;
}

.no-comments {
  color: #666;
  font-style: italic;
  margin-bottom: 15px;
}

.comments-list {
  margin-bottom: 15px;
}

.comment-item {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  border-color: #e6e8eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 14px;
}

.comment-actions-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.reply-btn {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.reply-btn:hover {
  background-color: #e6f7ff;
  color: #1890ff;
}

.reply-form {
  margin-top: 10px;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.comment-author {
  font-weight: bold;
  color: #333;
}

.comment-date {
  color: #666;
}

.featured {
  background-color: #e6a23c;
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}

.comment-content {
  margin-bottom: 5px;
  color: #333;
}

.comment-stats {
  font-size: 12px;
  color: #666;
}

.comment-form-area {
  margin-top: 15px;
}

.add-comment-btn {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-comment-btn:hover:not(:disabled) {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.add-comment-btn:disabled {
  background-color: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}

.comment-form {
  margin-top: 10px;
}

.comment-form textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  resize: vertical;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.cancel-btn {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background-color: #e6e8eb;
  color: #409eff;
  border-color: #c6e2ff;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #409eff;
}

.comment-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.comment-btn:hover:not(:disabled) {
  background-color: #66b1ff;
}

.comment-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* 消息通知样式 */
.notification-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-success {
  background-color: #67c23a;
  border-left: 4px solid #529b2e;
}

.notification-error {
  background-color: #f56c6c;
  border-left: 4px solid #e64949;
}

.notification-info {
  background-color: #409eff;
  border-left: 4px solid #337ecc;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .notification-message {
    left: 20px;
    right: 20px;
  }
}
</style>