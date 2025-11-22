import { defineStore } from 'pinia'

// 定义草稿接口
interface Draft {
  title: string
  content: string
  category: string
}

// localStorage键名常量
const STORAGE_KEYS = {
  USERNAME: 'username',
  TOKEN: 'token',
  POST_DRAFT: 'post_draft'
} as const

// 定义用户信息store
export const useUserStore = defineStore('user', {
  // 状态定义
  state: () => ({
    // 全局用户名字段
    username: localStorage.getItem(STORAGE_KEYS.USERNAME) || '',
    // 全局token字段
    token: localStorage.getItem(STORAGE_KEYS.TOKEN) || ''
  }),
  
  // Getters用于获取状态
  getters: {
    // 获取用户名
    getUsername(): string {
      return this.username
    },
    
    // 获取token
    getToken(): string {
      return this.token
    },
    
    // 判断用户是否已登录 - 修改为只检查用户名，因为后端可能不返回token
    // 登录成功后只要有用户名就认为已登录
    isLoggedIn(): boolean {
      return !!this.username
    }
  },
  
  // Actions用于修改状态
  actions: {
    // 设置用户信息（登录）
    setUserInfo(newUsername: string, newToken: string) {
      console.log('setUserInfo调用:', { newUsername, newToken });
      
      this.username = newUsername
      this.token = newToken
      
      // 保存到localStorage以持久化 - 添加空值检查
      if (newUsername) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, newUsername)
        console.log('setUserInfo - 保存username到localStorage:', newUsername);
      } else {
        localStorage.removeItem(STORAGE_KEYS.USERNAME)
        console.log('setUserInfo - 清除username从localStorage');
      }
      
      if (newToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken)
        console.log('setUserInfo - 保存token到localStorage: 有值');
      } else {
        // 空token时仍然保存空字符串，而不是移除，避免状态不一致
        localStorage.setItem(STORAGE_KEYS.TOKEN, '')
        console.log('setUserInfo - 保存空token到localStorage');
      }
    },
    
    // 设置用户名
    setUsername(newUsername: string) {
      this.username = newUsername
      // 保存到localStorage以持久化
      if (newUsername) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, newUsername)
      } else {
        localStorage.removeItem(STORAGE_KEYS.USERNAME)
      }
    },
    
    // 清除用户信息（登出）
    clearUserInfo() {
      this.username = ''
      this.token = ''
      // 清除localStorage中的用户信息
      localStorage.removeItem(STORAGE_KEYS.USERNAME)
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    },
    
    // 更新用户名
    updateUsername(newUsername: string) {
      // 这里可以添加一些验证逻辑
      if (newUsername && newUsername.length >= 3) {
        this.username = newUsername
        // 更新localStorage
        localStorage.setItem(STORAGE_KEYS.USERNAME, newUsername)
        return true
      }
      return false
    },
    
    // 从localStorage加载完整用户状态
    loadUserFromStorage() {
      const storedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME)
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
      
      if (storedUsername) {
        this.username = storedUsername
      }
      if (storedToken) {
        this.token = storedToken
      }
    },
    
  
    syncUserStatus() {
      try {
        // 记录调用来源（通过调用栈获取）
        const stack = new Error().stack;
        const callerInfo = stack?.split('\n')[2]?.trim() || 'unknown';
        
        // 从localStorage获取最新的用户状态
        const storedUsername = localStorage.getItem(STORAGE_KEYS.USERNAME)
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
        
        // 记录同步前的状态
        const previousStatus = {
          username: this.username,
          token: this.token,
          isLoggedIn: this.isLoggedIn
        };
        
        console.log('syncUserStatus调用来源:', callerInfo);
        console.log('syncUserStatus - 同步前状态:', previousStatus);
        console.log('syncUserStatus - localStorage读取值:', { storedUsername, storedToken });
        //   username: this.username,
        //   isLoggedIn: this.isLoggedIn
        // }
        
        
        
        // 处理用户名 - 更健壮的逻辑，避免意外清除
        if (storedUsername === null) {
          // localStorage中没有用户名，但store中有，保持store中的值
          console.log('syncUserStatus - localStorage中没有username，保持store当前值');
        } else {
          // localStorage中有用户名，更新到store
          if (this.username !== storedUsername) {
            this.username = storedUsername
            console.log('syncUserStatus - 从localStorage更新username:', storedUsername);
          }
        }
        
        // 处理token - 类似的健壮逻辑
        if (storedToken === null) {
          // localStorage中没有token，但store中有，保持store中的值
          console.log('syncUserStatus - localStorage中没有token，保持store当前值');
        } else {
          // localStorage中有token，更新到store
          if (this.token !== storedToken) {
            this.token = storedToken
            console.log('syncUserStatus - 从localStorage更新token');
          }
        }
        
        // 记录状态变更信息，便于调试
        if (previousStatus.username !== this.username) {
          console.log('用户名状态发生变化:', { 
            previous: previousStatus.username, 
            current: this.username 
          })
        }
        
        if (previousStatus.token !== this.token) {
          console.log('Token状态发生变化:', { 
            previous: previousStatus.token ? '有值' : '无值', 
            current: this.token ? '有值' : '无值' 
          })
        }
        
        if (previousStatus.isLoggedIn !== this.isLoggedIn) {
          console.log('登录状态发生变化:', { 
            previous: previousStatus.isLoggedIn, 
            current: this.isLoggedIn 
          })
        }
        
        console.log('同步用户状态完成:', { 
          username: this.username, 
          token: this.token ? '有值' : '无值',
          isLoggedIn: this.isLoggedIn 
        })
      } catch (error) {
        console.error('同步用户状态时发生错误:', error)
        // 出错时不改变当前状态，保持系统稳定性
      }
    }
  }
})

// 定义草稿store
export const useDraftStore = defineStore('draft', {
  // 状态定义
  state: () => ({
    // 草稿内容
    draft: {
      title: '',
      content: '',
      category: ''
    } as Draft
  }),
  
  // Getters用于获取状态
  getters: {
    // 获取完整草稿
    getDraft(): Draft {
      return this.draft
    },
    
    // 检查是否有草稿
    hasDraft(): boolean {
      return !!this.draft.title || !!this.draft.content || !!this.draft.category
    }
  },
  
  // Actions用于修改状态
  actions: {
    // 设置草稿内容
    setDraft(newDraft: Partial<Draft>) {
      this.draft = { ...this.draft, ...newDraft }
      // 自动保存到localStorage
      this.saveToLocalStorage()
    },
    
    // 清除草稿
    clearDraft() {
      this.draft = {
        title: '',
        content: '',
        category: ''
      }
      // 清除localStorage中的草稿
      localStorage.removeItem(STORAGE_KEYS.POST_DRAFT)
    },
    
    // 保存到localStorage
    saveToLocalStorage() {
      localStorage.setItem(STORAGE_KEYS.POST_DRAFT, JSON.stringify(this.draft))
    },
    
    // 从localStorage加载草稿
    loadFromLocalStorage() {
      const savedDraft = localStorage.getItem(STORAGE_KEYS.POST_DRAFT)
      if (savedDraft) {
        try {
          this.draft = JSON.parse(savedDraft)
        } catch (error) {
          console.error('加载草稿失败:', error)
          // 加载失败时清除无效数据
          localStorage.removeItem(STORAGE_KEYS.POST_DRAFT)
        }
      }
    }
  }
})