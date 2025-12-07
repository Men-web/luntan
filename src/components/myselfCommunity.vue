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
          
          <!-- 用户信息展示 -->
          <div class="user-profile-card">
            <div class="profile-header">
              <h3>用户信息</h3>
            </div>
            <div class="profile-content">
              <div class="profile-info">
                <div class="info-item">
                  <label>用户名：</label>
                  <span>{{ userInfo.username }}</span>
                </div>
                <div class="info-item">
                  <label>昵称：</label>
                  <span>{{ userInfo.nick_name || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>邮箱：</label>
                  <span>{{ userInfo.email || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>性别：</label>
                  <span>{{ userInfo.gender_display || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>出生日期：</label>
                  <span>{{ userInfo.birth_date || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>城市：</label>
                  <span>{{ userInfo.city || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>专业：</label>
                  <span>{{ userInfo.major || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <label>GitHub：</label>
                  <span v-if="userInfo.github"><a :href="userInfo.github" target="_blank">{{ userInfo.github }}</a></span>
                  <span v-else>未设置</span>
                </div>
                <div class="info-item full-width">
                  <label>个人简介：</label>
                  <p>{{ userInfo.bio || '未设置' }}</p>
                </div>
                <div class="info-item full-width">
                  <label>个性签名：</label>
                  <p>{{ userInfo.signature || '未设置' }}</p>
                </div>
                <div class="info-item full-width">
                  <label>兴趣爱好：</label>
                  <p>{{ userInfo.interests || '未设置' }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="personal-stats">
              <button class="stat-item" @click="navigateToPosts">
                <span class="stat-label">我的帖子</span>
              </button>
              <button class="stat-item" @click="navigateToComments">
                <span class="stat-label">我的评论</span>
              </button>
            </div>

            <!-- 个人信息编辑按钮 -->
            <div class="profile-actions">
              <button class="btn-edit-profile" @click="navigateToEdit">
                ✏️ 编辑个人信息
              </button>
            </div>
        </div>

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
import { useRouter } from 'vue-router';
import Navbar from './Navbar.vue';
import CommunityBase from './CommunityBase.vue';
import { useUserStore } from '../assets/stores';
import { post, get } from '../assets/http.js';

const userStore = useUserStore();
const router = useRouter();

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
      console.log('📊 用户信息加载成功:', userInfo);
    } else if (response) {
      // 响应存在但格式不正确
      console.warn('⚠️ API返回数据格式异常:', response);
      // 如果store已有用户名，保持不变
      if (userStore.username) {
        userInfo.username = userStore.username;
        console.log('🔄 使用store中已有的用户名:', userStore.username);
      }
    } else {
      // 用户未登录或API无响应
      console.log('❌ API未返回数据，但store中可能已有用户名:', userStore.username);
      // 如果store已有用户名，保持不变
      if (userStore.username) {
        userInfo.username = userStore.username;
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // API请求失败时，如果store已有用户名，保持userInfo中的用户名
    if (userStore.username) {
      userInfo.username = userStore.username;
    }
  }
};

// 导航到个人信息编辑页面
const navigateToEdit = () => {
  router.push('/profile/edit');
};

// 导航到我的帖子页面
const navigateToPosts = () => {
  router.push('/user/posts');
};

// 导航到我的评论页面
const navigateToComments = () => {
  router.push('/user/comments');
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

/* 用户信息卡片 */
.user-profile-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.profile-header h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.profile-content {
  display: flex;
  flex-direction: column;
}

.profile-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.info-item span {
  color: #333;
  font-size: 14px;
}

.info-item a {
  color: #3498db;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item.full-width p {
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
}

/* 统计信息 */
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

/* 个人信息编辑按钮 */
.profile-actions {
  margin-top: 20px;
  text-align: left;
}

.btn-edit-profile {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-edit-profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
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