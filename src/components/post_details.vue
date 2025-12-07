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
      <div class="comments-header">
        <h2 class="comments-title">评论 ({{ comments.length }})</h2>
        <button 
          v-if="comments.length > 0" 
          @click="toggleComments" 
          class="toggle-comments-btn"
        >
          {{ collapsedComments ? '展开' : '折叠' }}
        </button>
      </div>
      <div v-if="isLoadingComments" class="loading">评论加载中...</div>
      <div v-else-if="comments.length === 0" class="no-comments">暂无评论</div>
      <div v-else-if="!collapsedComments" class="comments-list">
        <!-- 渲染顶层评论 -->
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ typeof comment.author === 'object' ? comment.author.username : comment.author }}</span>
            <span class="comment-date">{{ comment.created_at }}</span>
            <button 
              v-if="isLoggedIn" 
              @click="toggleReplyForm(comment.id)" 
              class="reply-btn-top"
            >
              {{ showReplyForms[comment.id] ? '取消回复' : '回复' }}
            </button>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          <div class="comment-actions-area">
            <div class="comment-stats">
              <span class="like-count">👍 {{ comment.like_count }}</span>
            </div>
          </div>
          
          <!-- 回复表单 -->
          <div v-if="showReplyForms[comment.id]" class="reply-form">
            <div class="comment-input-container">
              <textarea
                v-model="replyForms[comment.id]"
                placeholder="回复..."
                class="comment-textarea"
                rows="1"
                @input="autoResizeReplyTextarea(comment.id)"
              ></textarea>
              <div class="comment-input-footer">
                <span class="char-count">{{ replyForms[comment.id]?.length || 0 }}/500</span>
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
          
          <!-- 渲染该评论的回复（嵌套评论） -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-container">
            <div class="replies-header">
              <span class="replies-count">回复 ({{ comment.replies.length }})</span>
              <button 
                @click="collapsedReplies[comment.id] = !collapsedReplies[comment.id]" 
                class="toggle-replies-btn"
              >
                {{ collapsedReplies[comment.id] ? '展开' : '折叠' }}
              </button>
            </div>
            <div v-if="!collapsedReplies[comment.id]" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="comment-item reply">
                <div class="comment-header">
                  <span class="comment-author">{{ typeof reply.author === 'object' ? reply.author.username : reply.author }}</span>
                  <span class="comment-date">{{ reply.created_at }}</span>
                  <button 
                    v-if="isLoggedIn" 
                    @click="toggleReplyForm(reply.id)" 
                    class="reply-btn-top"
                  >
                    {{ showReplyForms[reply.id] ? '取消回复' : '回复' }}
                  </button>
                </div>
                <p class="comment-content">{{ reply.content }}</p>
                <div class="comment-actions-area">
                  <div class="comment-stats">
                    <span class="like-count">👍 {{ reply.like_count }}</span>
                  </div>
                </div>
                 
                <!-- 回复表单 -->
                <div v-if="showReplyForms[reply.id]" class="reply-form">
                  <div class="comment-input-container">
                    <textarea
                      v-model="replyForms[reply.id]"
                      placeholder="回复..."
                      class="comment-textarea"
                      rows="1"
                      @input="autoResizeReplyTextarea(reply.id)"
                    ></textarea>
                    <div class="comment-input-footer">
                      <span class="char-count">{{ replyForms[reply.id]?.length || 0 }}/500</span>
                      <div class="comment-actions">
                        <button 
                          @click="cancelReply(reply.id)" 
                          class="cancel-btn"
                        >
                          取消
                        </button>
                        <button 
                          @click="submitReply(reply.id)" 
                          class="comment-btn"
                          :disabled="isSubmittingComment || !replyForms[reply.id]?.trim()"
                        >
                          {{ isSubmittingComment ? '回复中...' : '回复' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> <!-- Close replies-list -->
          </div>
        </div>
      </div>
      
      <!-- 发表评论表单 -->
      <div class="add-comment-section">
        <h3>发表评论</h3>
        <div v-if="!isLoggedIn" class="login-prompt">请先登录后再发表评论</div>
        <div v-else class="comment-form">
          <div class="comment-input-container">
            <textarea
              v-model="newComment"
              placeholder="分享你的观点..."
              class="comment-textarea"
              rows="1"
              @input="autoResizeTextarea"
            ></textarea>
            <div class="comment-input-footer">
              <span class="char-count">{{ newComment?.length || 0 }}/500</span>
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
        </div>
    </div>
  </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';
import { post as httpPost } from '../assets/http.js';

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
  author: string | { username: string };
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
const isLoggedIn = computed(() => userStore.isLoggedIn);

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
const collapsedComments = ref(false); // 默认显示且不折叠
// 控制评论回复列表折叠/展开的状态
const collapsedReplies = ref<Record<number, boolean>>({}); // 使用评论ID作为键



// 社区类型 - 从帖子数据中获取或默认设置
const communityType = ref<string>('movie'); // 默认值设为'movie'，后续会从帖子数据中更新

// 回复表单数据
const replyForms = reactive<Record<string | number, string>>({});
// 控制回复表单显示/隐藏的状态
const showReplyForms = reactive<Record<string | number, boolean>>({});

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

// 构建嵌套评论结构
const buildNestedComments = (comments: Comment[]) => {
  if (!comments || comments.length === 0) return [];
  
  const commentMap: Record<number, Comment> = {};
  const topLevelComments: Comment[] = [];
  
  // 首先将所有评论放入map中
  comments.forEach(comment => {
    comment.replies = []; // 初始化回复数组
    commentMap[comment.id] = comment;
  });
  
  // 然后构建嵌套结构
  comments.forEach(comment => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      // 这是一个回复，添加到父评论的replies数组中
      const parentComment = commentMap[comment.parent_id];
      if (parentComment && parentComment.replies) {
        parentComment.replies.push(comment);
      }
    } else {
      // 这是一个顶层评论
      topLevelComments.push(comment);
    }
  });
  
  return topLevelComments;
};

// 获取指定帖子的评论列表
const fetchComments = async () => {
  isLoadingComments.value = true;
  
  try {
    // 保存当前的折叠状态
    const savedCollapsedReplies = { ...collapsedReplies.value };
    const savedCollapsedComments = collapsedComments.value;
    
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
    let commentsData = [];
    if (Array.isArray(data)) {
      commentsData = data;
    } else if (data.success && Array.isArray(data.comments)) {
      commentsData = data.comments;
    } 
    
    // 添加调试日志，查看评论数据结构
    console.log('评论数据结构:', commentsData);
    
    // 处理扁平的评论数据，构建嵌套结构
    const processedComments = buildNestedComments(commentsData);
    comments.value = processedComments;
    
    // 恢复评论的折叠状态
    collapsedComments.value = savedCollapsedComments;
    
    // 设置每个评论的回复折叠状态，保留之前的状态
    commentsData.forEach((comment: Comment) => {
      if (comment.replies && comment.replies.length > 0) {
        // 如果之前有保存的状态，使用保存的状态，否则默认折叠
        collapsedReplies.value[comment.id] = savedCollapsedReplies[comment.id] !== undefined ? savedCollapsedReplies[comment.id]! : true;
      }
    });
    
    // 重置回复表单
    Object.keys(replyForms).forEach(key => delete replyForms[key]);
    Object.keys(showReplyForms).forEach(key => delete showReplyForms[key]);
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
    
    const response = await fetch(`${baseURL}/api/posts/${postId}/comments/add/`, {
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
      
      // 尝试实时添加回复到评论列表
      if (data.new_comment) {
        // 查找父评论
        const parentCommentIndex = comments.value.findIndex(c => c.id === parentId);
        if (parentCommentIndex !== -1 && comments.value[parentCommentIndex]) {
          // 确保父评论有replies数组
          const parentComment = comments.value[parentCommentIndex];
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          // 将新回复添加到父评论的replies数组中
          parentComment.replies.push(data.new_comment);
          // 自动展开该评论的回复
          collapsedReplies.value[parentId] = false;
        }
      } else {
        // 如果回复添加失败，重新获取评论列表
        await fetchComments();
      }
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

// 重置回复表单
const cancelReply = (commentId: number) => {
  showReplyForms[commentId] = false;
  replyForms[commentId] = '';
};

// 切换评论列表的折叠/展开状态
const toggleComments = () => {
  collapsedComments.value = !collapsedComments.value;
};

// 自动调整主评论文本域高度
const autoResizeTextarea = () => {
  const textarea = document.querySelector('.comment-textarea') as HTMLTextAreaElement;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }
};

// 自动调整回复文本域高度
const autoResizeReplyTextarea = (commentId: number) => {
  const textareas = document.querySelectorAll('.comment-textarea') as NodeListOf<HTMLTextAreaElement>;
  textareas.forEach((textarea, index) => {
    if (textarea.parentNode?.parentNode instanceof Element && textarea.parentNode.parentNode.classList.contains('reply-form')) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  });
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

/* 回复列表样式 */
.replies-list {
  margin-left: 30px; /* 左侧缩进，显示层级关系 */
  border-left: 2px solid #e8e8e8; /* 左侧边框，增强层级感 */
  padding-left: 15px;
  margin-top: 10px;
}

/* 回复评论样式 */
.comment-item.reply {
  margin-top: 10px;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 评论头部样式优化 */
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

/* 顶部回复按钮样式 */
.reply-btn-top {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.reply-btn-top:hover {
  background-color: #66b1ff;
}





/* 评论输入容器样式 */
.comment-input-container {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.comment-input-container:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 评论文本域样式 */
.comment-textarea {
  width: 100%;
  padding: 12px 15px;
  border: none;
  border-radius: 8px 8px 0 0;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  background-color: transparent;
  overflow-y: hidden;
  transition: all 0.3s ease;
}

.comment-textarea::placeholder {
  color: #c0c4cc;
  font-style: italic;
}

.comment-textarea:focus {
  outline: none;
}

/* 评论输入框底部栏 */
.comment-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 15px;
  background-color: #fafafa;
  border-top: 1px solid #ebeef5;
}

/* 字数统计 */
.char-count {
  font-size: 12px;
  color: #909399;
}

/* 回复表单样式优化 */
.reply-form {
  margin-top: 12px;
  margin-left: 0;
}

/* 评论操作按钮样式优化 */
.comment-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-btn {
  background-color: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
}

.comment-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.comment-btn:hover {
  background-color: #66b1ff;
}

/* 移除旧的表单控件样式 */
.form-control {
  display: none;
}

/* 添加评论框悬停效果 */
.comment-input-container:hover {
  border-color: #c6e2ff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
}

/* 优化评论区头部样式 */
.add-comment-section h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

/* 登录提示样式优化 */
.login-prompt {
  padding: 20px;
  background-color: #f0f9eb;
  border: 1px solid #d9f7be;
  border-radius: 8px;
  color: #67c23a;
  text-align: center;
  font-size: 14px;
}

/* 回复评论样式 */
.comment-item.reply {
  margin-top: 10px;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 回复评论的回复表单 */
.comment-item.reply .reply-form {
  margin-top: 10px;
  margin-left: 0;
}

/* 回复表单样式 */
.reply-form {
  margin-top: 10px;
  margin-left: 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.reply-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.reply-form textarea:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.reply-form .comment-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
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

.comments-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.comments-title {
  font-size: 20px;
  color: #333;
  margin: 0;
}

.toggle-comments-btn {
  background-color: #f0f0f0;
  color: #666;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.toggle-comments-btn:hover {
  background-color: #e0e0e0;
}
</style>