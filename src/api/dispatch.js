import request from '@/utils/request'

/**
 * 添加派车记录
 */
export function addDispatchRecord(data) {
  return request({
    url: '/dispatch',
    method: 'post',
    data
  })
}

/**
 * 更新派车记录
 */
export function updateDispatchRecord(id, data) {
  return request({
    url: `/dispatch/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除派车记录
 */
export function deleteDispatchRecord(id) {
  return request({
    url: `/dispatch/${id}`,
    method: 'delete'
  })
}

/**
 * 获取派车记录详情
 */
export function getDispatchRecordById(id) {
  return request({
    url: `/dispatch/${id}`,
    method: 'get'
  })
}

/**
 * 查询派车记录列表
 */
export function getDispatchRecordList(params) {
  return request({
    url: '/dispatch',
    method: 'get',
    params
  })
}

/**
 * 获取驾驶员月度详细记录
 */
export function getMonthlyDetail(params) {
  return request({
    url: '/dispatch/monthly-detail',
    method: 'get',
    params
  })
}

/**
 * 获取驾驶员月度统计数据
 */
export function getMonthlyStatistics(params) {
  return request({
    url: '/dispatch/monthly-statistics',
    method: 'get',
    params
  })
}

/**
 * 获取车辆上一次的收车公里数
 */
export function getLastEndMileage(vehicleId) {
  return request({
    url: '/dispatch/last-end-mileage',
    method: 'get',
    params: { vehicleId }
  })
}

/**
 * 重新计算所有派车记录的金额
 */
export function recalculateAllAmounts() {
  return request({
    url: '/dispatch/recalculate-amounts',
    method: 'post'
  })
}
