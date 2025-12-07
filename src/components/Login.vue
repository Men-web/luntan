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
        <!-- 切换标签 -->
        <div class="tab-container">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'login' }" 
            @click="activeTab = 'login'"
          >
            登录
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'forget' }" 
            @click="activeTab = 'forget'"
          >
            忘记密码
          </div>
        </div>
        
        <!-- 登录表单 -->
        <div v-if="activeTab === 'login'">
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="identifier">用户名/邮箱</label>
              <input
                type="text"
                id="identifier"
                v-model="loginForm.identifier"
                placeholder="请输入用户名或邮箱"
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
        </div>
        
        <!-- 忘记密码表单 -->
        <div v-else>
          <form @submit.prevent="handleForgetPassword">
            <div class="form-group">
              <label for="forget-email">邮箱</label>
              <input
                type="email"
                id="forget-email"
                v-model="forgetForm.email"
                placeholder="请输入注册邮箱"
                required
              />
            </div>
            <div class="form-group">
              <label for="forget-code">验证码</label>
              <div class="code-input-container">
                <input
                  type="text"
                  id="forget-code"
                  v-model="forgetForm.code"
                  placeholder="请输入验证码"
                  required
                />
                <button 
                  type="button" 
                  class="code-btn"
                  :disabled="isLoading || countdown > 0"
                  @click="sendVerificationCode"
                >
                  {{ countdown > 0 ? `${countdown}s后重新发送` : '获取验证码' }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label for="forget-new-password">新密码</label>
              <input
                type="password"
                id="forget-new-password"
                v-model="forgetForm.newPassword"
                placeholder="请输入新密码"
                required
              />
            </div>
            <div class="form-group">
              <label for="forget-confirm-password">确认新密码</label>
              <input
                type="password"
                id="forget-confirm-password"
                v-model="forgetForm.confirmPassword"
                placeholder="请再次输入新密码"
                required
              />
            </div>
            <button type="submit" class="login-btn" :disabled="isLoading">
              {{ isLoading ? '重置中...' : '重置密码' }}
            </button>
          </form>
        </div>
        
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

// 活动标签页
const activeTab = ref('login');

// 登录表单数据
const loginForm = reactive({
  identifier: '',
  password: ''
});

// 忘记密码表单数据
const forgetForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
});

// 验证码倒计时
const countdown = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

// 加载状态
const isLoading = ref(false);

// 错误信息
const errorMessage = ref('');

// 发送验证码
const sendVerificationCode = async () => {
  if (!forgetForm.email) {
    errorMessage.value = '请先输入邮箱';
    return;
  }
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await fetch(`${baseURL}/api/user/send_code/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: forgetForm.email })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || '发送验证码失败，请检查邮箱是否正确');
    }
    
    const data = await response.json();
    // 开始倒计时
    startCountdown();
    errorMessage.value = data.message || '验证码发送成功，请查收邮箱';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '发送验证码时发生错误';
  } finally {
    isLoading.value = false;
  }
};

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  }, 1000);
};

// 验证验证码
const verifyCode = async (email: string, code: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseURL}/api/user/verify_code/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, code })
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || '验证码验证失败');
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

// 处理忘记密码请求
const handleForgetPassword = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  // 验证新密码和确认密码是否一致
  if (forgetForm.newPassword !== forgetForm.confirmPassword) {
    errorMessage.value = '新密码和确认密码不一致';
    isLoading.value = false;
    return;
  }
  
  try {
    // 1. 先验证验证码
    await verifyCode(forgetForm.email, forgetForm.code);
    
    // 2. 验证码验证成功后，设置新密码
    const response = await fetch(`${baseURL}/api/user/set_new_password/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 确保接收和发送cookie
      body: JSON.stringify({
        email: forgetForm.email,
        code: forgetForm.code,
        new_password: forgetForm.newPassword
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // 显示后端返回的具体错误信息
      if (data.errors) {
        // 如果后端返回的是Django REST Framework风格的错误
        const errorMessages = Object.values(data.errors).map((error: any) => error[0]).join('\n');
        errorMessage.value = errorMessages;
      } else {
        errorMessage.value = data.message || '重置密码失败，请检查密码格式';
      }
      return;
    }
    
    // 重置密码成功处理
    console.log('重置密码成功', data);
    
    // 提示用户重新登录
    errorMessage.value = data.message || '密码重置成功，请重新登录';
    activeTab.value = 'login'; // 切换回登录标签
    
    // 清空忘记密码表单
    forgetForm.email = '';
    forgetForm.code = '';
    forgetForm.newPassword = '';
    forgetForm.confirmPassword = '';
    
    // 重置倒计时
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      countdown.value = 0;
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '重置密码时发生错误';
  } finally {
    isLoading.value = false;
  }
};

// API基础URL - 从配置文件导入


// 邮箱验证正则表达式
const isEmail = (str: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

// 处理登录请求
const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    // 检测输入是邮箱还是用户名
    const isUserEmail = isEmail(loginForm.identifier);
    
    // 构造请求体和API路径
    let requestBody;
    let apiPath;
    
    if (isUserEmail) {
      // 邮箱登录 - 使用email和password字段
      requestBody = {
        email: loginForm.identifier,
        password: loginForm.password
      };
      apiPath = `${baseURL}/api/user/login_by_email/`; // 邮箱登录API路径
    } else {
      // 用户名登录 - 使用username和password字段
      requestBody = {
        username: loginForm.identifier,
        password: loginForm.password
      };
      apiPath = `${baseURL}/api/user/login/`; // 用户名登录API路径
    }
    
    const response = await fetch(apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 确保接收和发送cookie
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // 显示后端返回的具体错误信息
      if (data.errors) {
        // 如果后端返回的是Django REST Framework风格的错误
        const errorMessages = Object.values(data.errors).map((error: any) => error[0]).join('\n');
        errorMessage.value = errorMessages;
      } else {
        errorMessage.value = data.message || '登录失败，请检查用户名和密码';
      }
      return;
    }
    
    // 登录成功处理
    console.log('登录成功', data);
    
    // 获取用户名 - 从返回数据中获取
    const username = data.username || data.user?.username || loginForm.identifier;
    
    console.log('登录成功 - 准备保存用户信息:', { username });
    
    // 通过用户store保存登录信息，确保状态管理的一致性
    userStore.setUserInfo(username);
    
    // 验证保存是否成功
    const savedUsername = localStorage.getItem('username');
    console.log('登录成功，localStorage保存结果:', { savedUsername });
    console.log('登录成功，store状态:', { username: userStore.username, isLoggedIn: userStore.isLoggedIn });
    
    // 不使用setTimeout，直接使用router.replace进行跳转
    // 使用replace可以替换当前路由，避免用户返回到登录页面
    router.replace('/');
  } catch (error) {
    console.error('登录错误:', error);
    errorMessage.value = error instanceof Error ? error.message : '登录时发生网络错误，请稍后重试';
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
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

/* 标签页样式 */
.tab-container {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: #409eff;
}

.tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: 500;
}

/* 验证码输入容器样式 */
.code-input-container {
  display: flex;
  gap: 10px;
}

.code-input-container input {
  flex: 1;
}

.code-btn {
  padding: 10px 15px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  background-color: #85ce61;
}

.code-btn:disabled {
  background-color: #c0eb75;
  cursor: not-allowed;
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