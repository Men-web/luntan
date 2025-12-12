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
        <div v-html="post.content"></div>
        
        <!-- 调试信息 -->
        <div style="margin: 20px 0; padding: 10px; background: #f0f0f0; border-radius: 4px;">
          <p>调试信息:</p>
          <p>图片数量: {{ post.images?.length || 0 }}</p>
          <p>图片URLs: {{ post.images?.join(', ') || '无' }}</p>
        </div>
        
        <!-- 九宫格图片展示 -->
        <div v-if="post.images && post.images.length > 0" class="post-images">
          <img 
            v-for="(image, index) in post.images" 
            :key="index" 
            :src="image" 
            class="post-image-preview" 
            alt="帖子图片" 
            @click="openImageViewer(image)" 
          />
        </div>
        <div v-else>
          <p>没有图片可显示</p>
        </div>
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
        <!-- 使用CommentItem组件渲染评论，支持无限嵌套回复 -->
        <CommentItem
          v-for="comment in comments"
          :key="comment.id"
          :comment="comment"
          :is-logged-in="isLoggedIn"
          :is-submitting-comment="isSubmittingComment"
          :collapsed-replies="collapsedReplies"
          @submit-reply="handleSubmitReply"
          @cancel-reply="handleCancelReply"
        />
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
    <!-- 图片查看器模态框 -->
    <div v-if="showImageViewer" class="image-viewer-overlay" @click="closeImageViewer">
      <div class="image-viewer-content" @click.stop>
        <img :src="currentImage" class="viewer-image" alt="放大查看" />
        <button class="close-btn" @click="closeImageViewer">&times;</button>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';
import { post as httpPost } from '../assets/http.js';
import CommentItem from './CommentItem.vue';

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
  images?: string[];
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
  is_recommended: false,
  images: []
});

// 图片查看器状态
const showImageViewer = ref(false);
const currentImage = ref('');

// 打开图片查看器
const openImageViewer = (imageUrl: string) => {
  currentImage.value = imageUrl;
  showImageViewer.value = true;
};

// 关闭图片查看器
const closeImageViewer = () => {
  showImageViewer.value = false;
  currentImage.value = '';
};
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
      // 移除帖子内容中的所有图片标签，只保留纯文本内容
      const processedContent = data.post.content.replace(/<img\s+[^>]*>/gi, '').replace(/\n\s*\n/g, '\n').trim();
      
      console.log('原始post数据:', data.post);
      console.log('images字段类型:', typeof data.post.images);
      console.log('images字段是否为数组:', Array.isArray(data.post.images));
      
      // 处理images字段中的图片URL，如果images不是数组或者为空，则从content中提取
        const imgUrls: string[] = [];
        
        // 先尝试使用专门的images字段
        if (data.post.images) {
          console.log('原始的images字段:', data.post.images);
          let imagesData = data.post.images;
          
          // 确保images是数组格式
          if (!Array.isArray(imagesData)) {
            imagesData = [imagesData];
            console.log('转换为数组后的images:', imagesData);
          }
          
          // 处理图片URL，支持相对路径和绝对路径
          for (const img of imagesData.slice(0, 9)) {
            console.log('处理前的单个图片URL:', img);
            if (typeof img === 'string') {
              // 处理可能的字符串前后空格
              const trimmedImg = img.trim();
              console.log('去除空格后的图片URL:', trimmedImg);
              
              // 根据不同的URL类型进行处理
              let processedUrl = '';
              if (trimmedImg.startsWith('http')) {
                // 已经是完整的URL，直接使用
                processedUrl = trimmedImg;
              } else if (trimmedImg.startsWith('/')) {
                // 以/开头的路径，直接拼接baseURL
                processedUrl = `${baseURL}${trimmedImg}`;
              } else if (trimmedImg.startsWith('images/') || trimmedImg.startsWith('media/')) {
                // 以images/或media/开头的路径，添加baseURL前缀
                processedUrl = `${baseURL}/${trimmedImg}`;
              } else {
                // 其他情况，假设是相对路径
                processedUrl = `${baseURL}/images/${trimmedImg}`;
              }
              
              console.log('最终处理后的图片URL:', processedUrl);
              imgUrls.push(processedUrl);
            }
          }
        }
        
        // 不再从content中提取图片，因为后端已经完成了这个工作
        // 这样可以避免重复处理并提高性能
      
      // 更新帖子数据
      post.value = { 
        ...data.post, 
        content: processedContent,
        images: imgUrls
      };
      
      // 强制更新DOM
      setTimeout(() => {
        console.log('强制更新后的图片URL:', post.value.images);
        const images = document.querySelectorAll('.post-image-preview');
        console.log('实际渲染的图片数量:', images.length);
        images.forEach((img, index) => {
          console.log(`图片${index}的src:`, img.src);
          console.log(`图片${index}的显示状态:`, getComputedStyle(img).display);
        });
      }, 100);
      
      console.log('最终的帖子图片URL:', post.value.images);
      console.log('baseURL:', baseURL);
      
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
        // 查找父评论（支持嵌套回复）
        const findParentComment = (commentsList: Comment[]): Comment | undefined => {
          for (const comment of commentsList) {
            if (comment.id === parentId) {
              return comment;
            }
            if (comment.replies && comment.replies.length > 0) {
              const found = findParentComment(comment.replies);
              if (found) return found;
            }
          }
          return undefined;
        };
        
        const parentComment = findParentComment(comments.value);
        if (parentComment) {
          // 确保父评论有replies数组
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

// 处理子组件提交回复
const handleSubmitReply = async (parentId: number, content: string) => {
  replyForms[parentId] = content;
  await submitReply(parentId);
};

// 处理子组件取消回复
const handleCancelReply = (parentId: number) => {
  cancelReply(parentId);
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

/* 确保富文本中的图片在详情页正确显示 */
.post-body > div > img {
  display: none;
}

/* 确保九宫格图片正常显示 */
.post-images img {
  display: block;
}

/* 九宫格图片样式 */
.post-images {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr) !important;
  gap: 4px !important;
  max-width: 300px !important;
  margin-top: 20px !important;
  padding: 10px !important;
  background-color: #f9f9f9 !important;
  border-radius: 8px !important;
  visibility: visible !important;
  opacity: 1 !important;
  height: auto !important;
  width: auto !important;
}

.post-image-preview {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 1 / 1 !important;
  object-fit: cover !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  border: 1px solid #e0e0e0 !important;
  visibility: visible !important;
  opacity: 1 !important;
  display: block !important;
  content-visibility: visible !important;
}

.post-image-preview:hover {
  transform: scale(1.05);
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 特殊情况处理：1张图片 */
.post-images:has(.post-image-preview:nth-child(1):last-child) {
  grid-template-columns: 1fr;
  max-width: 150px;
}

/* 特殊情况处理：2张图片 */
.post-images:has(.post-image-preview:nth-child(2):last-child) {
  grid-template-columns: repeat(2, 1fr);
  max-width: 140px;
}

/* 特殊情况处理：4张图片 */
.post-images:has(.post-image-preview:nth-child(4):last-child) {
  grid-template-columns: repeat(2, 1fr);
  max-width: 140px;
}

/* 图片查看器样式 */
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.viewer-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: -30px;
  right: -30px;
  background-color: transparent;
  color: white;
  border: none;
  font-size: 30px;
  cursor: pointer;
  padding: 5px;
}

.close-btn:hover {
  color: #ccc;
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