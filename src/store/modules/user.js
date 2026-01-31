import { login, getUserInfo } from '@/api/auth'

const state = {
  token: localStorage.getItem('token') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
  selectedDriverId: localStorage.getItem('selectedDriverId') || null,
  selectedMonth: null
}

const getters = {
  token: state => state.token,
  userInfo: state => state.userInfo,
  userId: state => state.userInfo.id,
  username: state => state.userInfo.username,
  realName: state => state.userInfo.realName,
  userRole: state => {
    const role = state.userInfo.role
    return role === 2 ? 'ADMIN' : 'DRIVER'
  },
  driverId: state => state.userInfo.driverId,
  selectedDriverId: state => state.selectedDriverId,
  selectedMonth: state => state.selectedMonth
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },
  SET_SELECTED_DRIVER_ID(state, driverId) {
    state.selectedDriverId = driverId
    if (driverId) {
      localStorage.setItem('selectedDriverId', driverId)
    } else {
      localStorage.removeItem('selectedDriverId')
    }
  },
  SET_SELECTED_MONTH(state, month) {
    state.selectedMonth = month
  },
  CLEAR_TOKEN(state) {
    state.token = ''
    localStorage.removeItem('token')
  },
  CLEAR_USER_INFO(state) {
    state.userInfo = {}
    localStorage.removeItem('userInfo')
  }
}

const actions = {
  // 用户登录
  async login({ commit }, { username, password }) {
    console.log('开始登录流程, 用户名:', username)
    const res = await login({ username, password })
    console.log('登录响应:', res)
    if (res.code === 200) {
      console.log('登录成功, Token:', res.data ? res.data.substring(0, 20) + '...' : 'null')
      commit('SET_TOKEN', res.data)
      console.log('Token已保存到store和localStorage')
      return true
    }
    console.log('登录失败:', res.message)
    return false
  },

  // 获取用户信息
  async getUserInfo({ commit }) {
    console.log('开始获取用户信息')
    const res = await getUserInfo()
    console.log('获取用户信息响应:', res)
    if (res.code === 200) {
      console.log('用户信息获取成功:', res.data)
      commit('SET_USER_INFO', res.data)
      return res.data
    }
    console.log('用户信息获取失败:', res.message)
    return null
  },

  // 用户登出
  logout({ commit }) {
    commit('CLEAR_TOKEN')
    commit('CLEAR_USER_INFO')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
