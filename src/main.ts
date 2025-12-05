import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import MainPage from './components/mainPage.vue'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import CommunityPage from './components/CommunityPage.vue'
import MyselfCommunity from './components/myselfCommunity.vue'
import create_post from './components/create_post.vue'
import post_details from './components/post_details.vue'
import { useUserStore } from './assets/stores'
import { baseURL } from './assets/url'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'MainPage',
      component: MainPage
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    },
    {
      path: '/bookCommunity',
      name: 'BookCommunity',
      component: CommunityPage
    },
    {
      path: '/movieCommunity',
      name: 'MovieCommunity',
      component: CommunityPage
    },
    {
      path: '/myselfCommunity',
      name: 'MyselfCommunity',
      component: MyselfCommunity
    },
    {
      path: '/createPost',
      name: 'CreatePost',
      component: create_post
    },
    {
      path: '/daliy_life',
      name: 'DaliyLife',
      component: CommunityPage
    },
    {
      path: '/post/:postId',
      name: 'PostDetails',
      component: post_details
    }
  ]
})

// 添加全局路由守卫 - 移除所有状态同步逻辑
// 路由守卫只负责路由导航，不处理状态管理
router.beforeEach((to, from, next) => {
  // 直接继续路由导航，不进行任何状态同步
  // 这样可以避免路由切换时对用户状态的任何干扰
  next()
})

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 使用路由和Pinia
app.use(router)
app.use(pinia)

// 挂载应用
app.mount('#app')

// 应用初始化后，加载并同步用户状态
const userStore = useUserStore()

// 先从localStorage加载完整用户状态（包括token）
userStore.loadUserFromStorage()

// 开发环境下暂时注释掉自动验证token，避免状态丢失
// 在生产环境中可以重新启用此验证
/*
if (userStore.isLoggedIn) {
  // 验证token的有效性
  fetch(`${baseURL}/api/user/verify/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${userStore.getToken}`
    }
  }).then(response => {
    if (!response.ok) {
      // Token无效，清除所有登录状态
      console.log('Token验证失败，清除登录状态')
      userStore.clearUserInfo()
    }
  }).catch(error => {
    console.error('验证token时发生错误:', error)
    // 在开发环境中为了方便测试，我们暂时不清除用户状态
    // 在生产环境中应该清除用户状态
    if (import.meta.env.PROD) {
      userStore.clearUserInfo()
    }
  })
}
*/
