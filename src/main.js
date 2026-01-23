import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 修复 ResizeObserver 错误
const resizeObserver = window.ResizeObserver
window.ResizeObserver = class extends resizeObserver {
  constructor(callback) {
    super(callback)
    this.callback = callback
  }
  observe(...args) {
    try {
      super.observe(...args)
    } catch (e) {
      if (e.message !== 'ResizeObserver loop completed with undelivered notifications.') {
        throw e
      }
    }
  }
}

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(store)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

// 忽略 ResizeObserver 错误
const resizeObserverErrorHandler = (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopPropagation()
    e.preventDefault()
    return
  }
  console.error(e)
}
window.addEventListener('error', resizeObserverErrorHandler)

// 忽略 Promise 错误
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopPropagation()
    e.preventDefault()
    return
  }
  console.error('Unhandled Promise Rejection:', e)
})

app.mount('#app')
