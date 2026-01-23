import axios from 'axios'
import { ElMessage } from 'element-plus'
import store from '@/store'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送前做一些处理
    // 直接从localStorage读取token，避免store时序问题
    const token = localStorage.getItem('token')
    console.log('请求拦截器 - 当前token:', token ? token.substring(0, 20) + '...' : 'null')
    console.log('请求拦截器 - 请求URL:', config.url)

    // 密码重置接口不需要token
    const isResetPassword = config.url && config.url.includes('/auth/reset-driver-password')

    if (token && !isResetPassword) {
      // 让每个请求携带token（除了密码重置接口）
      config.headers['Authorization'] = 'Bearer ' + token
      console.log('请求拦截器 - 已添加Authorization头')
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    const res = response.data

    // 如果响应的状态码不是200,则判断为错误
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401: 未登录或token过期
      if (res.code === 401) {
        store.dispatch('user/logout')
        router.push('/login')
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)

    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未登录或登录已过期')
          store.dispatch('user/logout')
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data.message || '请求失败')
      }
    } else {
      ElMessage.error('网络连接失败')
    }

    return Promise.reject(error)
  }
)

export default service
