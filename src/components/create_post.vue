<template>
  <div class="post-form-container">
    <h2>发布新帖子</h2>
    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-group">
        <label for="title">标题</label>
        <input
          type="text"
          id="title"
          v-model="postForm.title"
          placeholder="请输入帖子标题"
          class="form-control"
          required
        />
      </div>
      <div class="form-group">
        <label for="category">分类</label>
        <select id="category" v-model="postForm.category" class="form-control" required>
          <option value="">请选择分类</option>
          <option value="book">书</option>
          <option value="movie">电影</option>
          <option value="myself">生活树洞</option>
        </select>
      </div>
      <div class="form-group">
        <label for="content">内容</label>
        <div id="content" ref="quillEditor" :class="{ 'disabled': isSubmitting }"></div>
      </div>
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        {{ isSubmitting ? '发布中...' : '发布帖子' }}
      </button>
      <button type="button" class="clear-btn" @click="clearDraft" v-if="draftStore.hasDraft">
        清除草稿
      </button>
      <button type="button" class="cancel-btn" @click="cancelPost">
        退出发帖
      </button>
    </form>
    <div v-if="submitMessage" :class="['message', messageType]">
      {{ submitMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';
import { useDraftStore } from '../assets/stores';
// 导入Quill.js编辑器和相关模块
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import ImageUploader from 'quill-image-uploader';
// 暂时移除imageDrop模块，避免初始化错误
// import * as ImageDrop from 'quill-image-drop-module';

// 定义事件
const emit = defineEmits<{
  postCreated: []
}>();

// 发帖表单数据
const postForm = reactive({
  title: '',
  content: '',
  category: ''
});

// 自动保存草稿的定时器
let saveTimer: number | null = null;

// 创建路由实例
const router = useRouter();

// 获取用户store
const userStore = useUserStore();

// 获取草稿store
const draftStore = useDraftStore();

// 状态变量
const isSubmitting = ref(false);
const submitMessage = ref('');
const messageType = ref<'success' | 'error'>('success');

// Quill编辑器实例
const quillEditor = ref<HTMLDivElement | null>(null);
let quill: Quill | null = null;

// 注册Quill插件
Quill.register('modules/imageUploader', ImageUploader);
// 暂时移除imageDrop模块注册，避免初始化错误
// Quill.register('modules/imageDrop', ImageDrop);

// Quill编辑器配置
const quillOptions = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['image']
    ],
    imageUploader: {
      upload: async (file: File) => {
        try {
          const formData = new FormData();
          formData.append('image', file);
          
          const token = localStorage.getItem('token');
          const response = await fetch(`${baseURL}/api/tiezi/upload_image/`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          });
          
          if (!response.ok) {
            throw new Error('图片上传失败');
          }
          
          const data = await response.json();
          if (data.success && data.url) {
            return data.url;
          } else {
            throw new Error('图片上传失败: ' + (data.message || '未知错误'));
          }
        } catch (error) {
          console.error('图片上传失败:', error);
          throw error;
        }
      }
    }
  },
  placeholder: '请输入帖子内容...',
};

// 取消发帖并返回主页
const cancelPost = () => {
  if (postForm.title || postForm.content || postForm.category) {
    // 如果有未保存的内容，询问用户是否保存草稿
    if (confirm('您有未保存的内容，是否保存为草稿后退出？')) {
      draftStore.setDraft({
        title: postForm.title,
        content: postForm.content,
        category: postForm.category
      });
      // 注意：setDraft方法内部已经调用了saveToLocalStorage()，无需重复调用
    }
  }
  router.push('/');
}

// 组件挂载时加载草稿并初始化Quill编辑器
onMounted(() => {
  // 初始化Quill编辑器
  if (quillEditor.value) {
    try {
      quill = new Quill(quillEditor.value, quillOptions);
      
      // 监听编辑器内容变化，同步到postForm.content
      quill.on('text-change', () => {
        const html = quill?.root.innerHTML || '';
        postForm.content = html;
      });
    } catch (error) {
      console.error('Quill初始化错误:', error);
      // 可以提供一个备用方案或显示错误信息
      submitMessage.value = '编辑器初始化失败，请刷新页面重试';
      messageType.value = 'error';
    }
  }
  
  // 加载草稿
  draftStore.loadFromLocalStorage();
  
  // 如果有草稿，恢复到表单中
  const draft = draftStore.getDraft;
  if (draftStore.hasDraft) {
    postForm.title = draft.title || '';
    postForm.category = draft.category || '';
    
    // 设置编辑器内容
    if (quill && draft.content) {
      quill.root.innerHTML = draft.content;
      postForm.content = draft.content;
    }
  }
});

// 监听表单变化，自动保存草稿（使用防抖避免频繁保存）
watch(
  postForm,
  (newForm) => {
    // 清除之前的定时器
    if (saveTimer) {
      clearTimeout(saveTimer);
    }
    
    // 设置新的定时器，300ms后保存
    saveTimer = setTimeout(() => {
      draftStore.setDraft(newForm);
    }, 300);
  },
  { deep: true }
);

// 提交帖子
const submitPost = async () => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    // 未登录，跳转到登录页面
    router.push('/login');
    return;
  }
  isSubmitting.value = true;
  submitMessage.value = '';
  
  try {
    console.log('发送的数据:', postForm); // 调试信息
    // 获取存储的token
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
     };
    
    // 如果有token，添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${baseURL}/api/tiezi/create/`, {
      method: 'POST',
      headers,
      credentials: 'include', // 确保发送cookie
      body: JSON.stringify(postForm)
    });
    
    // 添加详细的错误处理
    if (!response.ok) {
      // 尝试获取后端返回的错误信息
      let errorData;
      try {
        errorData = await response.json();
        console.error('后端返回的错误信息:', errorData);
      } catch (e) {
        // 如果无法解析JSON，使用状态文本
        errorData = { message: response.statusText };
      }
      throw new Error(`发帖失败: ${errorData.message || '未知错误'}`);
    }
    
    const data = await response.json();
    submitMessage.value = '帖子发布成功！';
    messageType.value = 'success';
    
    // 重置表单
    postForm.title = '';
    postForm.content = '';
    postForm.category = '';
    
    // 清除草稿
    draftStore.clearDraft();
    
    // 通知父组件帖子已创建，以便刷新列表
    emit('postCreated');
    
    // 3秒后清除成功消息
    setTimeout(() => {
      submitMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('发帖请求错误:', error);
    submitMessage.value = error instanceof Error ? error.message : '发帖时发生错误';
    messageType.value = 'error';
  } finally {
    isSubmitting.value = false;
  }
};

// 清除草稿的方法（供用户主动清除）
const clearDraft = () => {
  // 清空表单
  postForm.title = '';
  postForm.content = '';
  postForm.category = '';
  
  // 清除store中的草稿
  draftStore.clearDraft();
  
  // 显示清除成功消息
  submitMessage.value = '草稿已清除';
  messageType.value = 'success';
  
  // 3秒后清除消息
  setTimeout(() => {
    submitMessage.value = '';
  }, 3000);
};
</script>

<style scoped>
.post-form-container {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.post-form-container h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5em;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #555;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  background-color: #66b1ff;
}

.submit-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.clear-btn {
  background-color: #f56c6c;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
  margin-top: 10px;
}

.clear-btn:hover {
  background-color: #f78989;
}

.cancel-btn {
  background-color: #909399;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: flex-start;
  margin-top: 10px;
}

.cancel-btn:hover {
  background-color: #a6a9ad;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
}

.message.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.message.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}
</style>