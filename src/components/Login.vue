<template>
  <div class="login-container">
    <div class="login-form">
      <!-- 已登录状态 -->
      <div v-if="userStore.isLoggedIn" class="welcome-section">
        <h2>欢迎您 {{ userStore.username }}</h2>
        <p class="welcome-message">您已成功登录系统</p>
      </div>
      
      <!-- 未登录状态 -->
      <div v-else>
        <h2>登录</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              type="text"
              id="username"
              v-model="loginForm.username"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              required
            />
          </div>
          <button type="submit" class="login-btn" :disabled="isLoading">
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';

// 获取路由实例
const router = useRouter();

// 获取用户store
const userStore = useUserStore();

// 组件挂载时，从localStorage加载用户状态
// 注意：主要的token验证逻辑在main.ts中已实现，这里只需确保本地状态同步
onMounted(() => {
  userStore.loadUserFromStorage();
});

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

// 加载状态
const isLoading = ref(false);

// 错误信息
const errorMessage = ref('');

// API基础URL - 从配置文件导入


// 处理登录请求
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await fetch(`${baseURL}/api/user/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 确保接收和发送cookie
      body: JSON.stringify(loginForm)
    });
    
    if (!response.ok) {
      throw new Error('登录失败，请检查用户名和密码');
    }
    
    const data = await response.json();
    // 登录成功处理
    console.log('登录成功', data);
    
    // 获取用户名
    const username = data.username || loginForm.username;
    
    // 获取token（如果没有返回token，使用空字符串或默认值）
    const token = data.token || '';
    
    console.log('登录成功 - 准备保存用户信息:', { username, token });
    
    // 通过用户store保存登录信息，确保状态管理的一致性
    userStore.setUserInfo(username, token);
    
    // 验证保存是否成功
    const savedUsername = localStorage.getItem('username');
    const savedToken = localStorage.getItem('token');
    console.log('登录成功，localStorage保存结果:', { savedUsername, savedToken });
    console.log('登录成功，store状态:', { username: userStore.username, isLoggedIn: userStore.isLoggedIn });
    
    // 不使用setTimeout，直接使用router.replace进行跳转
    // 使用replace可以替换当前路由，避免用户返回到登录页面
    router.replace('/');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录时发生错误';
    // 清除可能存在的不完整登录状态
    // 注意：userStore.clearUserInfo()内部已经处理了localStorage的清除
    userStore.clearUserInfo();
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  margin-bottom: 30px;
  text-align: center;
  color: #333;
}

/* 欢迎部分样式 */
.welcome-section {
  text-align: center;
}

.welcome-message {
  color: #666;
  font-size: 16px;
  margin-top: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #409eff;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #66b1ff;
}

.login-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #fef0f0;
  color: #f56c6c;
  border-radius: 4px;
  font-size: 14px;
}
</style>