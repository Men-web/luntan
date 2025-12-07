<template>
  <div class="register-container">
    <div class="register-form">
      <!-- 已登录状态 -->
      <div v-if="userStore.isLoggedIn" class="welcome-section">
        <h2>欢迎您 {{ userStore.username }}</h2>
        <p class="welcome-message">您已成功登录系统</p>
      </div>
      
      <!-- 未登录状态 -->
      <div v-else>
        <h2>注册</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="username">用户名</label>
            <input
              type="text"
              id="username"
              v-model="registerForm.username"
              placeholder="请输入用户名"
              :class="{ 'error-input': fieldErrors.username }"
              required
            />
            <div v-if="fieldErrors.username" class="field-error">
              {{ fieldErrors.username }}
            </div>
            <div v-if="suggestions.username" class="suggestion">
              建议使用：{{ suggestions.username }}
            </div>
          </div>
          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              type="email"
              id="email"
              v-model="registerForm.email"
              placeholder="请输入邮箱"
              :class="{ 'error-input': fieldErrors.email }"
              required
            />
            <div v-if="fieldErrors.email" class="field-error">
              {{ fieldErrors.email }}
            </div>
          </div>
          <div class="form-group">
            <label for="nickname">昵称</label>
            <input
              type="text"
              id="nickname"
              v-model="registerForm.nickname"
              placeholder="请输入昵称"
              :class="{ 'error-input': fieldErrors.nickname }"
              required
            />
            <div v-if="fieldErrors.nickname" class="field-error">
              {{ fieldErrors.nickname }}
            </div>
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              v-model="registerForm.password"
              placeholder="请输入密码"
              :class="{ 'error-input': fieldErrors.password }"
              required
            />
            <div v-if="fieldErrors.password" class="field-error">
              {{ fieldErrors.password }}
            </div>
          </div>
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              placeholder="请再次输入密码"
              :class="{ 'error-input': fieldErrors.confirmPassword }"
              required
            />
            <div v-if="fieldErrors.confirmPassword" class="field-error">
              {{ fieldErrors.confirmPassword }}
            </div>
          </div>
          <button type="submit" class="register-btn" :disabled="isLoading">
            {{ isLoading ? '注册中...' : '注册' }}
          </button>
        </form>
        <div v-if="globalError" class="error-message">
          {{ globalError }}
        </div>
        <div class="login-link">
          已有账号？<a @click="goToLogin">登录</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { baseURL } from '../assets/url';
import { useUserStore } from '../assets/stores';

// 获取路由实例
const router = useRouter();

// 获取用户store
const userStore = useUserStore();

// 注册表单数据
const registerForm = reactive({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
});

// 加载状态
const isLoading = ref(false);

// 错误信息
const globalError = ref('');

// 字段错误信息
const fieldErrors = reactive({
  username: '',
  email: '',
  nickname: '',
  password: '',
  confirmPassword: ''
});

// 后端建议
const suggestions = reactive({
  username: '',
  email: ''
});

// 表单验证正则表达式
const isEmail = (str: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

// 验证用户名：4-20个字符，只能包含字母、数字和下划线
const validateUsername = (username: string): { valid: boolean; message: string } => {
  if (username.length < 4) {
    return { valid: false, message: '用户名至少需要4个字符' };
  }
  if (username.length > 20) {
    return { valid: false, message: '用户名不能超过20个字符' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' };
  }
  return { valid: true, message: '' };
};

// 验证密码：8-20个字符，包含字母和数字
const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: '密码至少需要8个字符' };
  }
  if (password.length > 20) {
    return { valid: false, message: '密码不能超过20个字符' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含字母和数字' };
  }
  return { valid: true, message: '' };
};

// 重置错误信息
const resetErrors = () => {
  globalError.value = '';
  fieldErrors.username = '';
  fieldErrors.email = '';
  fieldErrors.nickname = '';
  fieldErrors.password = '';
  fieldErrors.confirmPassword = '';
  suggestions.username = '';
  suggestions.email = '';
};

// 处理注册请求
const handleRegister = async () => {
  isLoading.value = true;
  resetErrors();
  
  // 前端表单验证
  let hasError = false;
  
  const usernameValidation = validateUsername(registerForm.username);
  if (!usernameValidation.valid) {
    fieldErrors.username = usernameValidation.message;
    hasError = true;
  }
  
  if (!isEmail(registerForm.email)) {
    fieldErrors.email = '请输入有效的邮箱地址';
    hasError = true;
  }
  
  const passwordValidation = validatePassword(registerForm.password);
  if (!passwordValidation.valid) {
    fieldErrors.password = passwordValidation.message;
    hasError = true;
  }
  
  // 验证密码和确认密码是否一致
  if (registerForm.password !== registerForm.confirmPassword) {
    fieldErrors.confirmPassword = '密码和确认密码不一致';
    hasError = true;
  }
  
  if (hasError) {
    isLoading.value = false;
    return;
  }
  
  try {
    // 准备发送给后端的数据（去除confirmPassword字段）
    const registerData = {
      username: registerForm.username,
      email: registerForm.email,
      nickname: registerForm.nickname,
      password: registerForm.password
    };
    
    const response = await fetch(`${baseURL}/api/user/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 确保接收和发送cookie
      body: JSON.stringify(registerData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // 处理后端返回的错误信息
      if (data.error_type === 'validation_failed' && data.validation_errors) {
        // 处理字段验证错误
        const validationErrors = data.validation_errors;
        
        // 显示每个字段的错误信息
        if (validationErrors.username) {
          fieldErrors.username = validationErrors.username.message;
        }
        
        if (validationErrors.email) {
          fieldErrors.email = validationErrors.email.message;
        }
        
        if (validationErrors.nickname) {
          fieldErrors.nickname = validationErrors.nickname.message;
        }
        
        if (validationErrors.password) {
          fieldErrors.password = validationErrors.password.message;
        }
        
        // 显示后端建议
        if (data.suggestions) {
          if (data.suggestions.username) {
            suggestions.username = data.suggestions.username;
          }
          
          if (data.suggestions.email) {
            suggestions.email = data.suggestions.email;
          }
        }
      } else {
        // 显示全局错误信息
        globalError.value = data.error || data.message || '注册失败，请检查输入信息';
      }
      return;
    }
    
    // 注册成功处理
    console.log('注册成功', data);
    
    // 获取用户名 - 从返回数据中获取
    const username = data.username || data.user?.username || registerForm.username;
    
    // 通过用户store保存登录信息，确保状态管理的一致性
    userStore.setUserInfo(username);
    
    // 注册成功后跳转到首页
    router.replace('/');
  } catch (error) {
    console.error('注册错误:', error);
    globalError.value = error instanceof Error ? error.message : '注册时发生网络错误，请稍后重试';
    } finally {
      isLoading.value = false;
    }
  };

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.register-form h2 {
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

.register-btn {
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

.register-btn:hover:not(:disabled) {
  background-color: #66b1ff;
}

.register-btn:disabled {
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

.field-error {
  margin-top: 5px;
  color: #f56c6c;
  font-size: 12px;
}

.field-error:first-letter {
  text-transform: capitalize;
}

.error-input {
  border-color: #f56c6c !important;
}

.suggestion {
  margin-top: 5px;
  color: #67c23a;
  font-size: 12px;
  font-style: italic;
}

.login-link {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>