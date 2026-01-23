import request from '@/utils/request'

/**
 * 计算月度统计
 */
export function calculateMonthlyStatistics(data) {
  return request({
    url: '/statistics/calculate',
    method: 'post',
    data
  })
}

/**
 * 确认月度统计
 */
export function confirmStatistics(data) {
  return request({
    url: '/statistics/confirm',
    method: 'post',
    data
  })
}

/**
 * 审核月度统计
 */
export function auditStatistics(data) {
  return request({
    url: '/statistics/audit',
    method: 'post',
    data
  })
}

/**
 * 获取月度统计列表
 */
export function getMonthlyStatisticsList(params) {
  return request({
    url: '/statistics/monthly',
    method: 'get',
    params
  })
}

/**
 * 获取月度统计详情
 */
export function getStatisticsById(id) {
  return request({
    url: `/statistics/${id}`,
    method: 'get'
  })
}
