import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/resetpassword.vue'),
    meta: { title: '重置密码', requiresAuth: false }
  },
  {
    path: '/profile',
    component: () => import('@/layout/mainlayout.vue'),
    meta: { title: '个人信息', requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@/views/profile.vue'),
        meta: { title: '个人信息', requiresAuth: true }
      }
    ]
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    component: () => import('@/layout/mainlayout.vue'),
    meta: { title: '首页', requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: { title: '首页', requiresAuth: true }
      }
    ]
  },
  // 派车记录路由（管理员和驾驶员都可访问）
  {
    path: '/dispatch',
    component: () => import('@/layout/mainlayout.vue'),
    meta: { title: '派车记录', requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dispatch',
        component: () => import('@/views/driver/dispatchrecord.vue'),
        meta: { title: '派车记录', requiresAuth: true }
      }
    ]
  },
  // 驾驶员端路由（管理员和驾驶员都可访问）
  {
    path: '/driver',
    component: () => import('@/layout/mainlayout.vue'),
    meta: { title: '驾驶员端', requiresAuth: true },
    children: [
      {
        path: 'monthly-detail',
        name: 'DriverMonthlyDetail',
        component: () => import('@/views/driver/monthlydetail.vue'),
        meta: { title: '月度详细', requiresAuth: true }
      },
      {
        path: 'statistics',
        name: 'DriverStatistics',
        component: () => import('@/views/driver/statistics.vue'),
        meta: { title: '个人统计', requiresAuth: true }
      }
    ]
  },
  // 管理端路由
  {
    path: '/admin',
    component: () => import('@/layout/mainlayout.vue'),
    meta: { title: '管理端', requiresAuth: true, role: 'ADMIN' },
    children: [
      {
        path: 'monthly-statistics',
        name: 'AdminMonthlyStatistics',
        component: () => import('@/views/admin/monthlystatistics.vue'),
        meta: { title: '月度统计', requiresAuth: true, role: 'ADMIN' }
      },
      {
        path: 'fee-standard',
        name: 'AdminFeeStandard',
        component: () => import('@/views/admin/feestandard.vue'),
        meta: { title: '费用标准', requiresAuth: true, role: 'ADMIN' }
      },
      {
        path: 'driver-management',
        name: 'AdminDriverManagement',
        component: () => import('@/views/admin/drivermanagement.vue'),
        meta: { title: '驾驶员管理', requiresAuth: true, role: 'ADMIN' }
      },
      {
        path: 'vehicle-management',
        name: 'AdminVehicleManagement',
        component: () => import('@/views/admin/vehiclemanagement.vue'),
        meta: { title: '车辆管理', requiresAuth: true, role: 'ADMIN' }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: { title: '404', requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - ${process.env.VUE_APP_TITLE}` : process.env.VUE_APP_TITLE

  try {
    // 检查是否需要认证
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    // 直接从localStorage读取token，避免store时序问题
    const token = localStorage.getItem('token')

    if (requiresAuth && !token) {
      next('/login')
      return
    }

    // 检查角色权限
    if (to.meta.role) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const userRole = userInfo.role === 2 ? 'ADMIN' : 'DRIVER'
      if (userRole !== to.meta.role) {
        next('/404')
        return
      }
    }

    // 如果访问的是首页，根据用户角色重定向
    if (to.path === '/' || to.path === '/dashboard') {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      const userRole = userInfo.role === 2 ? 'ADMIN' : 'DRIVER'
      if (userRole === 'DRIVER') {
        next('/dispatch')
        return
      }
    }

    next()
  } catch (error) {
    console.error('路由守卫错误:', error)
    next('/login')
  }
})

export default router
