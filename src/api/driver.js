import request from '@/utils/request'

/**
 * 添加驾驶员
 */
export function addDriver(data) {
  return request({
    url: '/driver',
    method: 'post',
    data
  })
}

/**
 * 更新驾驶员信息
 */
export function updateDriver(id, data) {
  return request({
    url: `/driver/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除驾驶员
 */
export function deleteDriver(id) {
  return request({
    url: `/driver/${id}`,
    method: 'delete'
  })
}

/**
 * 获取驾驶员列表
 */
export function getDriverList(params) {
  return request({
    url: '/driver',
    method: 'get',
    params
  })
}

/**
 * 获取所有在职驾驶员列表
 */
export function getActiveDrivers() {
  return request({
    url: '/driver/active',
    method: 'get'
  })
}

/**
 * 根据ID获取驾驶员信息
 */
export function getDriverById(id) {
  return request({
    url: `/driver/${id}`,
    method: 'get'
  })
}

/**
 * 批量更新驾驶员工资标准
 */
export function batchUpdateDriverWages(data) {
  return request({
    url: '/driver/batch-update-wages',
    method: 'post',
    data
  })
}

/**
 * 重新计算所有驾驶员的每日工资
 */
export function recalculateDailyWages() {
  return request({
    url: '/driver/recalculate-daily-wages',
    method: 'post'
  })
}
