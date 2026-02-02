/**
 * 请求管理器
 * 用于管理重复请求和请求取消
 */
import axios from 'axios'

const pendingRequests = new Map()

/**
 * 生成请求的唯一标识
 * @param {Object} config axios请求配置
 * @returns {String} 请求唯一标识
 */
function generateRequestKey(config) {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

/**
 * 添加请求到待处理列表
 * @param {Object} config axios请求配置
 */
export function addPendingRequest(config) {
  const requestKey = generateRequestKey(config)

  // 取消重复请求
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey)
    cancel('取消重复请求')
  }

  config.cancelToken = new axios.CancelToken(cancel => {
    pendingRequests.set(requestKey, cancel)
  })
}

/**
 * 从待处理列表中移除请求
 * @param {Object} config axios请求配置
 */
export function removePendingRequest(config) {
  const requestKey = generateRequestKey(config)
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey)
    cancel('取消请求')
    pendingRequests.delete(requestKey)
  }
}

/**
 * 清空所有待处理请求
 */
export function clearPendingRequests() {
  pendingRequests.forEach((cancel, key) => {
    cancel('取消请求')
  })
  pendingRequests.clear()
}
