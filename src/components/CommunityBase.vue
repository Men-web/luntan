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
      <div class="posts-header">
        <h2>{{ title || '帖子列表' }}</h2>
        <div class="header-actions">
          <button @click="toggleFeaturedFilter" class="filter-button" :class="{ 'active': showFeaturedOnly }">
            {{ showFeaturedOnly ? '显示全部' : '只看精选' }}
          </button>
          <button v-if="userStore.isLoggedIn" @click="goToCreatePost" class="create-post-button">
            <span class="button-icon">+</span>
            <span class="button-text">发帖</span>
          </button>
        </div>
      </div>
      <div v-if="isLoadingPosts" class="loading">加载中...</div>
      <div v-else-if="posts.length === 0" class="no-posts">暂无帖子</div>
      <div v-else class="posts-list">
        <div v-for="post in filteredPosts" :key="post.id" :class="['post-item', { 'recommended-post': post.is_recommended }]">
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
            <div class="comments-header">
              <h4>评论 ({{ post.comments.length }})</h4>
              <button 
                v-if="post.comments.length > 0" 
                @click="toggleComments(post.id)" 
                class="toggle-comments-btn"
              >
                {{ collapsedComments[post.id] ? '展开' : '折叠' }}
              </button>
            </div>
            <div v-if="post.comments.length === 0" class="no-comments">暂无评论</div>
            <div v-else-if="!collapsedComments[post.id]" class="comments-list">
              <!-- 渲染顶层评论 -->
              <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author.username || comment.author }}</span>
                  <span class="comment-date">{{ comment.created_at }}</span>
                  <span v-if="comment.is_featured" class="featured">精选</span>
                </div>
                <p class="comment-content">{{ comment.content }}</p>
                <div class="comment-actions-area">
                  <div class="comment-stats">
                    <span class="like-count">👍 {{ comment.like_count }}</span>
                  </div>
                  <button 
                    v-if="userStore.isLoggedIn && !comment.parent_id" 
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
                      <span class="comment-author">{{ reply.author.username || reply.author }}</span>
                      <span class="comment-date">{{ reply.created_at }}</span>
                      <span v-if="reply.is_featured" class="featured">精选</span>
                    </div>
                    <p class="comment-content">{{ reply.content }}</p>
                    <div class="comment-actions-area">
                      <div class="comment-stats">
                        <span class="like-count">👍 {{ reply.like_count }}</span>
                      </div>
                      <!-- 嵌套回复不显示回复按钮，限制回复深度为两级 -->
                      <button 
                        v-if="false" 
                        @click="toggleReplyForm(post.id, reply.id)" 
                        class="reply-btn"
                      >
                        {{ showReplyForms[`${post.id}-${reply.id}`] ? '取消回复' : '回复' }}
                      </button>
                    </div>
                    
                    <!-- 回复表单 -->
                    <div v-if="showReplyForms[`${post.id}-${reply.id}`]" class="reply-form">
                      <textarea
                        v-model="replyForms[`${post.id}-${reply.id}`]"
                        placeholder="请输入回复内容"
                        class="form-control"
                        rows="2"
                      ></textarea>
                      <div class="comment-actions">
                        <button 
                          @click="cancelReply(post.id, reply.id)" 
                          class="cancel-btn"
                        >
                          取消
                        </button>
                        <button 
                          @click="submitReply(post.id, reply.id)" 
                          class="comment-btn"
                          :disabled="isSubmittingComment || !userStore.isLoggedIn || !replyForms[`${post.id}-${reply.id}`]?.trim()"
                        >
                          {{ isSubmittingComment ? '回复中...' : '回复' }}
                        </button>
                      </div>
                    </div>
                  </div>
                  </div> <!-- Close replies-list -->
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
// 定义评论数据类型
interface Comment {
  id: number;
  author: string | { username: string };
  content: string;
  created_at: string;
  like_count: number;
  parent_id?: number;
  replies?: Comment[];
  is_featured?: boolean;
}
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
// 控制评论列表折叠/展开的状态
const collapsedComments = reactive<Record<number, boolean>>({});
// 控制评论回复列表折叠/展开的状态
const collapsedReplies = reactive<Record<number, boolean>>({}); // 使用评论ID作为键

// 辅助函数：确保帖子评论处于折叠状态
const ensureCommentCollapsed = (postId: number, hasComments: boolean) => {
  if (hasComments) {
    collapsedComments[postId] = true;
  } else {
    // 如果没有评论，不需要显示折叠按钮
    delete collapsedComments[postId];
  }
};

// 辅助函数：确保评论回复处于折叠状态
const ensureRepliesCollapsed = (commentId: number, hasReplies: boolean) => {
  if (hasReplies) {
    collapsedReplies[commentId] = true;
  } else {
    // 如果没有回复，不需要显示折叠按钮
    delete collapsedReplies[commentId];
  }
};

// 状态变量
const isSubmittingComment = ref(false);
const isLoadingPosts = ref(true);
const posts = ref<any[]>([]);
// 控制是否只显示精选帖子
const showFeaturedOnly = ref(false);

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

// 跳转到创建帖子页面
const goToCreatePost = () => {
  router.push('/createPost');
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
    // 使用与帖子API一致的路径结构
    const response = await fetch(`${baseURL}/api/posts/${postId}/comments/add/`, {
      method: 'POST',
      headers,
      credentials: 'include', // 发送凭证，确保用户身份正确识别
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
    
    // 显示成功消息
    showNotification(result.message || '评论提交成功', 'success');
    
    // 如果是回复，尝试实时添加到评论列表中
    if (parentId && result.new_comment) {
      // 查找对应的帖子
      const postIndex = posts.value.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        // 查找父评论
    const parentCommentIndex = posts.value[postIndex].comments.findIndex((c: Comment) => c.id === parentId);
        if (parentCommentIndex !== -1) {
          // 确保父评论有replies数组
          if (!posts.value[postIndex].comments[parentCommentIndex].replies) {
            posts.value[postIndex].comments[parentCommentIndex].replies = [];
          }
          // 将新回复添加到父评论的replies数组中
          posts.value[postIndex].comments[parentCommentIndex].replies.push(result.new_comment);
          // 自动展开该评论的回复
          collapsedReplies[parentId] = false;
        }
      }
    } else {
      // 如果是新评论或回复添加失败，重新获取该帖子的评论
      await fetchCommentsForPost(postId);
    }
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
          // 先保存帖子数据，不包含评论
          const rawPosts = data.posts;
          posts.value = rawPosts.map((post: any) => ({ 
            ...post, 
            comments: [] // 初始化为空数组，后续单独获取评论
          }));
          
          // 为每个帖子获取评论
          await fetchCommentsForAllPosts(); 
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
        // 先保存帖子数据，不包含评论
        const rawPosts = data.posts;
        posts.value = rawPosts.map((post: any) => ({ 
          ...post, 
          comments: [] // 初始化为空数组，后续单独获取评论
        }));
        
        // 为每个帖子获取评论
        await fetchCommentsForAllPosts();
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

// 切换精选帖子筛选
const toggleFeaturedFilter = () => {
  showFeaturedOnly.value = !showFeaturedOnly.value;
};

// 计算过滤后的帖子列表
const filteredPosts = computed(() => {
  if (!showFeaturedOnly.value) {
    return posts.value;
  }
  return posts.value.filter(post => post.is_recommended);
});


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



// 切换评论列表的折叠/展开状态
const toggleComments = (postId: number) => {
  collapsedComments[postId] = !collapsedComments[postId];
};

// 构建嵌套评论结构
const buildNestedComments = (comments: any[]) => {
  if (!comments || comments.length === 0) return [];
  
  const commentMap: Record<number, any> = {};
  const topLevelComments: any[] = [];
  
  // 首先将所有评论放入map中
  comments.forEach(comment => {
    comment.replies = []; // 初始化回复数组
    commentMap[comment.id] = comment;
  });
  
  // 然后构建嵌套结构
  comments.forEach(comment => {
    if (comment.parent_id && commentMap[comment.parent_id]) {
      // 这是一个回复，添加到父评论的replies数组中
      commentMap[comment.parent_id].replies.push(comment);
    } else {
      // 这是一个顶层评论
      topLevelComments.push(comment);
    }
  });
  
  return topLevelComments;
};

// 获取指定帖子的评论列表
const fetchCommentsForPost = async (postId: number) => {
  try {
    // 保存当前的折叠状态
    const savedCollapsedReplies = { ...collapsedReplies };
    const savedCollapsedComments = collapsedComments[postId];
    
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
    
    if (response.ok) {
      const data = await response.json();
      
      // 更新对应帖子的评论数据
      const postIndex = posts.value.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        let comments = [];
        if (Array.isArray(data)) {
          comments = data;
        } else if (data.success && Array.isArray(data.comments)) {
          comments = data.comments;
        }
        
        // 添加调试日志，查看评论数据结构
        console.log(`帖子${postId}的评论数据结构:`, comments);
        
        // 处理扁平的评论数据，构建嵌套结构
        const processedComments = buildNestedComments(comments);
        
        // 更新帖子的评论列表
        posts.value[postIndex].comments = processedComments;
        
        // 恢复评论的折叠状态
        if (savedCollapsedComments !== undefined) {
          collapsedComments[postId] = savedCollapsedComments;
        } else {
          // 如果没有保存的状态，确保评论处于折叠状态
          ensureCommentCollapsed(postId, comments.length > 0);
        }
        
        // 为每个评论设置回复的折叠状态，保留之前的状态
        comments.forEach((comment: Comment) => {
          if (comment.replies && comment.replies.length > 0) {
            // 如果之前有保存的状态，使用保存的状态，否则默认折叠
            if (savedCollapsedReplies[comment.id] !== undefined) {
              collapsedReplies[comment.id] = savedCollapsedReplies[comment.id] !== undefined ? savedCollapsedReplies[comment.id]! : true;
            } else {
              collapsedReplies[comment.id] = true; // 默认折叠
            }
          } else {
            // 如果没有回复，不需要显示折叠按钮
            delete collapsedReplies[comment.id];
          }
        });
      }
    }
  } catch (error) {
    console.error(`获取帖子 ${postId} 的评论失败:`, error);
  }
};

// 为所有帖子获取评论
const fetchCommentsForAllPosts = async () => {
  // 使用Promise.all并行获取所有帖子的评论
  await Promise.all(
    posts.value.map(post => fetchCommentsForPost(post.id))
  );
  
  // 为所有有评论的帖子设置默认折叠状态
  posts.value.forEach(post => {
    if (post.comments && post.comments.length > 0) {
      collapsedComments[post.id] = true;
    }
  });
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

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  color: #409eff;
  border: 1px solid #dcdfe6;
  border-radius: 50px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  border-color: #c6e2ff;
  background: #ecf5ff;
}

.filter-button.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
}

.filter-button.active:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.create-post-button {
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
}

.create-post-button:hover {
  background: linear-gradient(135deg, #66b1ff, #409eff);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.6);
}

.create-post-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(64, 158, 255, 0.6);
}

.button-icon {
  font-size: 18px;
}

.button-text {
  font-size: 14px;
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
  margin-top: 15px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.post-comments h4 {
  margin-bottom: 10px;
  color: #333;
  font-size: 16px;
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