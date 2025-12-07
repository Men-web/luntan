<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 个人信息管理 -->
        <section class="profile-section">
          <div class="section-header">
            <h2>👤 个人信息管理</h2>
            <button class="btn-back" @click="router.back()">
              ← 返回我的空间
            </button>
          </div>
          
          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="form-grid">
              <!-- 基本信息 -->
              <div class="form-group">
                <label for="username">用户名 <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="username" 
                  v-model="userInfo.username"
                  placeholder="请输入用户名"
                  required
                />
                <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
              </div>

              <div class="form-group">
                <label for="nick_name">昵称</label>
                <input 
                  type="text" 
                  id="nick_name" 
                  v-model="userInfo.nick_name"
                  placeholder="请输入昵称"
                />
              </div>

              <div class="form-group">
                <label for="phone">手机号码</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="userInfo.phone"
                  placeholder="请输入手机号码"
                  pattern="^1[3-9]\d{9}$"
                />
                <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
              </div>

              <div class="form-group">
                <label for="gender">性别</label>
                <select id="gender" v-model="userInfo.gender">
                  <option value="">保密</option>
                  <option value="M">男</option>
                  <option value="F">女</option>
                  <option value="O">其他</option>
                </select>
              </div>

              <div class="form-group">
                <label for="birth_date">出生日期</label>
                <input 
                  type="date" 
                  id="birth_date" 
                  v-model="userInfo.birth_date"
                />
              </div>

              <div class="form-group">
                <label for="city">城市</label>
                <input 
                  type="text" 
                  id="city" 
                  v-model="userInfo.city"
                  placeholder="请输入所在城市"
                />
              </div>

              <div class="form-group">
                <label for="major">专业</label>
                <input 
                  type="text" 
                  id="major" 
                  v-model="userInfo.major"
                  placeholder="请输入专业"
                />
              </div>

              <div class="form-group">
                <label for="github">GitHub</label>
                <input 
                  type="url" 
                  id="github" 
                  v-model="userInfo.github"
                  placeholder="请输入GitHub地址"
                />
              </div>

              <div class="form-group full-width">
                <label for="bio">个人简介</label>
                <textarea 
                  id="bio" 
                  v-model="userInfo.bio"
                  placeholder="请输入个人简介"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group full-width">
                <label for="signature">个性签名</label>
                <input 
                  type="text" 
                  id="signature" 
                  v-model="userInfo.signature"
                  placeholder="请输入个性签名"
                  maxlength="200"
                />
                <div class="char-count">{{ userInfo.signature.length }}/200</div>
              </div>

              <div class="form-group full-width">
                <label for="interests">兴趣爱好</label>
                <textarea 
                  id="interests" 
                  v-model="userInfo.interests"
                  placeholder="请输入兴趣爱好"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save" :disabled="isSubmitting">
                <span v-if="isSubmitting">保存中...</span>
                <span v-else>保存修改</span>
              </button>
              <button type="button" class="btn-reset" @click="resetForm">重置</button>
            </div>

            <div v-if="message" class="message" :class="messageType">
              {{ message }}
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from './Navbar.vue';
import { useUserStore } from '../assets/stores';
import { post, get } from '../assets/http.js';

const router = useRouter();
const userStore = useUserStore();

// 用户信息数据
const userInfo = reactive({
  id: '',
  username: '',
  email: '',
  date_joined: '',
  last_login: '',
  phone: '',
  nick_name: '',
  gender: '',
  gender_display: '',
  birth_date: '',
  city: '',
  major: '',
  bio: '',
  signature: '',
  interests: '',
  github: ''
});

// 表单验证错误
interface FormErrors {
  username?: string;
  phone?: string;
}
const errors = reactive<FormErrors>({});

// 提交状态
const isSubmitting = ref(false);

// 提示信息
const message = ref('');
const messageType = ref('success');

// 保存原始数据，用于重置
const originalUserInfo = reactive({ ...userInfo });

// 加载用户信息
const loadUserInfo = async () => {
  try {
    // 调用API获取当前用户信息，请求会自动带上session cookie
    const response = await get('/api/user/get_current_user_info/');
    
    // 检查响应数据格式 - 后端返回的数据结构是 { success: true, data: {...}, ... }
    if (response && response.success && response.data && response.data.username) {
      // 正确解析API返回的用户信息，从data字段中获取
      Object.assign(userInfo, response.data);
      // 如果API返回的用户名与store中的用户名不一致，更新store
      if (userInfo.username !== userStore.username) {
        userStore.setUsername(userInfo.username);
        console.log('✅ 从API更新用户名:', userInfo.username);
      }
      // 初始化原始数据用于比较
      Object.assign(originalUserInfo, { ...userInfo });
      console.log('📊 用户信息加载成功:', userInfo);
    } else if (response) {
      // 响应存在但格式不正确
      console.warn('⚠️ API返回数据格式异常:', response);
      // 如果store已有用户名，保持不变
      if (userStore.username) {
        userInfo.username = userStore.username;
        console.log('🔄 使用store中已有的用户名:', userStore.username);
      }
      Object.assign(originalUserInfo, { ...userInfo });
    } else {
      // 用户未登录或API无响应
      console.log('❌ API未返回数据，但store中可能已有用户名:', userStore.username);
      // 如果store已有用户名，保持不变
      if (userStore.username) {
        userInfo.username = userStore.username;
        Object.assign(originalUserInfo, { ...userInfo });
      } else {
        message.value = '请先登录';
        messageType.value = 'error';
        router.replace('/login');
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    message.value = '获取用户信息失败，请稍后重试';
    messageType.value = 'error';
    // API请求失败时，如果store已有用户名，保持userInfo中的用户名
    if (userStore.username) {
      userInfo.username = userStore.username;
      Object.assign(originalUserInfo, { ...userInfo });
    } else {
      router.replace('/login');
    }
  }
};

// 表单验证
const validateForm = () => {
  const newErrors: any = {};
  
  // 用户名验证
  if (!userInfo.username.trim()) {
    newErrors.username = '用户名不能为空';
  } else if (userInfo.username.length < 3) {
    newErrors.username = '用户名长度不能少于3个字符';
  }
  
  // 手机号码验证
  if (userInfo.phone && !/^1[3-9]\d{9}$/.test(userInfo.phone)) {
    newErrors.phone = '请输入有效的手机号码';
  }
  
  Object.assign(errors, newErrors);
  return Object.keys(newErrors).length === 0;
};

// 保存个人信息
const saveProfile = async () => {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  message.value = '';
  
  try {
    // 检查用户名是否已修改，如果修改了则调用check_username API
    if (userInfo.username !== originalUserInfo.username) {
      try {
        const checkResponse = await get('/api/user/check_username/', { username: userInfo.username });
        // 根据后端API实际返回格式处理响应
        if (checkResponse && !checkResponse.available) {
          message.value = checkResponse.message || '用户名不可用';
          messageType.value = 'error';
          return;
        }
        // 如果available为true，说明用户名可用
      } catch (checkError: any) {
        // 捕获API调用错误
        message.value = '用户名检查失败：' + (checkError.message || '未知错误');
        messageType.value = 'error';
        return;
      }
    }
    
    // 调用后端API更新用户信息
    const response = await post('/api/user/update_user_profile/', userInfo);
    
    if (response.success) {
      message.value = response.message || '保存成功';
      messageType.value = 'success';
      // 更新原始数据
      Object.assign(originalUserInfo, { ...userInfo });
      // 更新store中的用户名
      userStore.setUsername(userInfo.username);
    } else {
      message.value = response.error || '保存失败';
      messageType.value = 'error';
    }
  } catch (error: any) {
    message.value = error.message || '保存失败，请稍后重试';
    messageType.value = 'error';
  } finally {
    isSubmitting.value = false;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(userInfo, originalUserInfo);
  Object.assign(errors, {});
  message.value = '';
};

// 页面挂载时加载用户信息
onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
/* 新增的样式 */
.profile-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  color: #2c3e50;
  font-size: 1.8em;
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

.profile-form {
  margin-top: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.required {
  color: #e74c3c;
  font-size: 14px;
  margin-left: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.error-message {
  margin-top: 6px;
  color: #e74c3c;
  font-size: 12px;
}

.char-count {
  margin-top: 6px;
  color: #666;
  font-size: 12px;
  text-align: right;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.btn-save {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-reset {
  padding: 12px 30px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>

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
</style>