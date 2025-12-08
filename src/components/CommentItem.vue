<template>
  <div class="comment-item">
    <div class="comment-header">
      <span class="comment-author">{{ typeof comment.author === 'object' ? comment.author.username : comment.author }}</span>
      <span class="comment-date">{{ comment.created_at }}</span>
      <button 
        v-if="isLoggedIn && !comment.parent_id" 
        @click="toggleReplyForm" 
        class="reply-btn-top"
      >
        {{ showReplyForm ? '取消回复' : '回复' }}
      </button>
    </div>
    <p class="comment-content">{{ comment.content }}</p>
    <div class="comment-actions-area">
      <div class="comment-stats">
        <span class="like-count">👍 {{ comment.like_count }}</span>
      </div>
    </div>
    
    <!-- 回复表单 -->
    <div v-if="showReplyForm" class="reply-form">
      <div class="comment-input-container">
        <textarea
          v-model="replyContent"
          placeholder="回复..."
          class="comment-textarea"
          rows="1"
          @input="autoResizeReplyTextarea"
        ></textarea>
        <div class="comment-input-footer">
          <span class="char-count">{{ replyContent?.length || 0 }}/500</span>
          <div class="comment-actions">
            <button 
              @click="cancelReply" 
              class="cancel-btn"
            >
              取消
            </button>
            <button 
              @click="submitReply" 
              class="comment-btn"
              :disabled="isSubmittingComment || !replyContent?.trim()"
            >
              {{ isSubmittingComment ? '回复中...' : '回复' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 渲染回复 -->
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
        <!-- 递归使用CommentItem组件渲染每个回复 -->
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :is-logged-in="isLoggedIn"
          :is-submitting-comment="isSubmittingComment"
          :collapsed-replies="collapsedReplies"
          @submit-reply="handleSubmitReply"
          @cancel-reply="handleCancelReply"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

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

// 定义组件属性
const props = defineProps<{
  comment: Comment;
  isLoggedIn: boolean;
  isSubmittingComment: boolean;
  collapsedReplies: Record<number, boolean>;
}>();

// 定义组件事件
const emit = defineEmits<{
  (e: 'submit-reply', parentId: number, content: string): void;
  (e: 'cancel-reply', parentId: number): void;
}>();

// 回复内容
const replyContent = ref('');
// 控制回复表单显示/隐藏
const showReplyForm = ref(false);

// 切换回复表单
const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value;
};

// 提交回复
const submitReply = () => {
  if (!replyContent.value?.trim()) return;
  emit('submit-reply', props.comment.id, replyContent.value.trim());
  replyContent.value = '';
  showReplyForm.value = false;
};

// 取消回复
const cancelReply = () => {
  showReplyForm.value = false;
  replyContent.value = '';
  emit('cancel-reply', props.comment.id);
};

// 处理提交回复事件
const handleSubmitReply = (parentId: number, content: string) => {
  emit('submit-reply', parentId, content);
};

// 处理取消回复事件
const handleCancelReply = (parentId: number) => {
  emit('cancel-reply', parentId);
};

// 自动调整回复文本域高度
const autoResizeReplyTextarea = () => {
  const textarea = document.querySelector('.comment-textarea') as HTMLTextAreaElement;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }
};
</script>

<style scoped>
.comment-item {
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  position: relative;
}

.comment-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-author {
  font-weight: bold;
  margin-right: 10px;
}

.comment-date {
  color: #666;
  font-size: 12px;
  margin-right: 10px;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-actions-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-stats {
  display: flex;
  align-items: center;
}

.like-count {
  margin-right: 10px;
  cursor: pointer;
}

.reply-btn-top {
  padding: 4px 8px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.reply-btn-top:hover {
  background-color: #0056b3;
}

/* 回复表单样式 */
.reply-form {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.comment-input-container {
  position: relative;
  margin-bottom: 10px;
}

.comment-textarea {
  width: 100%;
  min-height: 40px;
  max-height: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
}

.comment-input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.char-count {
  color: #666;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.cancel-btn {
  padding: 4px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.comment-btn {
  padding: 4px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-btn:hover {
  background-color: #0056b3;
}

.comment-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* 回复列表样式 */
.replies-container {
  margin-top: 15px;
  margin-left: 20px;
  border-left: 2px solid #eee;
  padding-left: 20px;
}

.replies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.replies-count {
  font-weight: bold;
}

.toggle-replies-btn {
  padding: 2px 6px;
  background-color: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.toggle-replies-btn:hover {
  background-color: #e0e0e0;
}

.replies-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 嵌套回复的额外样式 */
.nested-replies {
  margin-left: 15px;
  border-left: 2px solid #f0f0f0;
}
</style>