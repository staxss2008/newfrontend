import request from '@/utils/request'

/**
 * 获取系统日志列表
 */
export function getLogList(params) {
  return request({
    url: '/system/log',
    method: 'get',
    params
  })
}

/**
 * 清空系统日志
 */
export function clearLogs() {
  return request({
    url: '/system/log/clear',
    method: 'delete'
  })
}

/**
 * 获取系统配置
 */
export function getSystemConfig() {
  return request({
    url: '/system/config',
    method: 'get'
  })
}

/**
 * 更新系统配置
 */
export function updateSystemConfig(data) {
  return request({
    url: '/system/config',
    method: 'put',
    data
  })
}
