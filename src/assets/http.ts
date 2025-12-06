import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { baseURL } from './url';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // 确保发送cookie，支持Session认证
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const username = localStorage.getItem('username');
    
    console.log('HTTP请求拦截器:', {
      url: config.url,
      currentUsername: username,
      isLoggedIn: !!username
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 封装get和post方法
export const get = <T = any>(url: string, params?: any): Promise<T> => {
  return http.get(url, { params });
};

export const post = <T = any>(url: string, data?: any): Promise<T> => {
  return http.post(url, data);
};

export default http;