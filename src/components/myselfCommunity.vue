<template>
  <div class="app-wrapper">
    <!-- 头部导航栏 -->
    <Navbar />

    <!-- 主内容区域 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 个人功能区 -->
        <div class="personal-section">
          <div class="personal-info">
            <h2>我的空间</h2>
            <p>管理您的个人信息和活动</p>
          </div>
          <div class="personal-stats">
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">我的帖子</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">我的评论</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">获赞总数</span>
              </div>
            </div>
        </div>

        <!-- 个人信息管理 -->
        <section class="profile-section">
          <h2>👤 个人信息管理</h2>
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

        <!-- 个人IP打造宣传 -->
        <section class="ip-section">

          <h1>个人IP打造 - 记录你的璀璨人生</h1>
          
          <!-- 意义与价值 -->
          <div class="ip-value-section">
            <h2>🌟 打造个人IP的意义与价值</h2>
            <p>在这个信息碎片化的时代，每个人都值得拥有自己的声音和影响力。打造个人IP不仅是展示自我，更是：</p>
            <ul>
              <li>📖 记录每一个思想火花，让灵感不被遗忘</li>
              <li>✨ 分享独特人生经历，传递个人价值</li>
              <li>🤝 连接志同道合的人，建立深度关系</li>
              <li>🚀 实现个人品牌增值，开启无限可能</li>
            </ul>
            <p>普通人也可以像彗星划过夜空一样璀璨，而我们潜龙追求的是永恒，让你的影响力持久发光！</p>
          </div>

          <!-- 展示样例 -->
          <div class="ip-examples-section">
            <h2>✨ 优秀案例展示</h2>
            <div class="examples-grid">
              <div class="example-card">
                <h3>📚 知识博主IP</h3>
                <p>通过公众号分享读书笔记，建立了个人知识体系，吸引了10w+粉丝关注</p>
              </div>
              <div class="example-card">
                <h3>🎬 影视评论IP</h3>
                <p>深度解析电影内涵，形成独特影评风格，与多家影视公司建立合作</p>
              </div>
              <div class="example-card">
                <h3>🏪 店铺展示IP</h3>
                <p>为线下店铺打造线上展示平台，提升品牌知名度，销售额增长300%</p>
              </div>
            </div>
          </div>

          <!-- 服务内容 -->
          <div class="ip-services-section">
            <h2>💼 我们提供的个人IP服务</h2>
            <div class="services-grid">
              <div class="service-card">
                <h3>📝 公众号搭建与运营</h3>
                <ul>
                  <li>公众号首页格式设置</li>
                  <li>文章与图片排版设计</li>
                  <li>公众号文章末尾双向宣传</li>
                  <li>提供优质文章内容支持</li>
                </ul>
              </div>
              <div class="service-card">
                <h3>🌐 店铺线上展示</h3>
                <ul>
                  <li>根据店铺信息设计前端页面</li>
                  <li>部署到GitHub等平台</li>
                  <li>提供可访问的专属链接</li>
                  <li>响应式设计，适配各种设备</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
          <!-- 联系方式 -->
          <div class="ip-contact-section">
            <h2>🤝 联系我们</h2>
            <p>如果您对个人IP打造有兴趣，欢迎通过以下方式联系我们：</p>
            <div class="contact-info">
              <p><strong>自媒体账号：</strong>关注我们的公众号「潜龙平台」</p>
              <p><strong>微信：</strong>qianlong-platform</p>
              <p><strong>邮箱：</strong>contact@qianlong.com</p>
            </div>
            <p class="contact-note">我们期待与您一起，打造属于您的独特个人IP！</p>
          </div>
        
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import Navbar from './Navbar.vue';
import CommunityBase from './CommunityBase.vue';
import { useUserStore } from '../assets/stores';
import { post, get } from '../assets/http.js';

const userStore = useUserStore();

// 用户信息数据
const userInfo = reactive({
  username: '',
  phone: '',
  nick_name: '',
  gender: '',
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
    // 调用API获取当前用户信息，请求会自动带上token
    const response = await get('/api/user/profile/');
    if (response.success) {
      // 使用API返回的用户信息
      Object.assign(userInfo, response.data);
      // 如果API返回的用户名与store中的用户名不一致，更新store
      if (userInfo.username !== userStore.username) {
        userStore.setUsername(userInfo.username);
      }
    } else {
      // API请求失败时，至少使用store中的用户名
      if (userStore.username) {
        userInfo.username = userStore.username;
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 异常情况下，至少使用store中的用户名
    if (userStore.username) {
      userInfo.username = userStore.username;
    }
  }
  // 初始化原始数据用于比较
  Object.assign(originalUserInfo, { ...userInfo });
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

.profile-section h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;
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

/* 个人IP打造样式 */
.ip-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ip-section h1 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5em;
  text-align: center;
  font-weight: bold;
}

/* 意义与价值部分 */
.ip-value-section {
  margin-bottom: 40px;
}

.ip-value-section h2 {
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ip-value-section p {
  color: #555;
  margin-bottom: 20px;
  line-height: 1.8;
  font-size: 16px;
}

.ip-value-section ul {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ip-value-section li {
  color: #555;
  font-size: 16px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #3498db;
  transition: all 0.3s ease;
}

.ip-value-section li:hover {
  background: #e3f2fd;
  transform: translateX(5px);
}

/* 展示样例部分 */
.ip-examples-section {
  margin-bottom: 40px;
}

.ip-examples-section h2 {
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.example-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.example-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.6);
}

.example-card h3 {
  margin-bottom: 15px;
  font-size: 1.3em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.example-card p {
  line-height: 1.6;
  opacity: 0.9;
}

/* 服务内容部分 */
.ip-services-section {
  margin-bottom: 40px;
}

.ip-services-section h2 {
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.service-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.service-card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-card li {
  color: #555;
  font-size: 15px;
  margin-bottom: 12px;
  padding-left: 25px;
  position: relative;
  line-height: 1.6;
}

.service-card li::before {
  content: "✓";
  color: #27ae60;
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 2px;
}

/* 联系方式部分 */
.ip-contact-section {
  margin-bottom: 40px;
  text-align: center;
}

.ip-contact-section h2 {
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.ip-contact-section p {
  color: #555;
  margin-bottom: 20px;
  line-height: 1.8;
  font-size: 16px;
}

.contact-info {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 16px;
  margin: 20px auto;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contact-info p {
  margin: 15px 0;
  font-size: 16px;
}

.contact-info strong {
  color: #2c3e50;
  font-weight: bold;
}

.contact-note {
  color: #e74c3c !important;
  font-weight: bold;
  font-size: 16px;
  margin-top: 20px;
}

/* 个人功能区 */
.personal-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.personal-info {
  margin-bottom: 20px;
}

.personal-info h2 {
  font-size: 24px;
  margin-bottom: 5px;
  color: #333;
}

.personal-info p {
  color: #666;
}

.personal-stats {
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

/* 用户发布的社区文章展示 */
.user-posts-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-posts-section h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.8em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-posts-section p {
  color: #555;
  margin-bottom: 20px;
  font-size: 16px;
}

.community-posts {
  margin-bottom: 30px;
}

.community-posts h3 {
  color: #3498db;
  margin-bottom: 20px;
  font-size: 1.4em;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>