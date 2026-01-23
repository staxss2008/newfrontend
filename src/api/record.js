import request from '@/utils/request'

/**
 * 获取加油记录列表
 */
export function getFuelRecordList(params) {
  return request({
    url: '/fuel-record',
    method: 'get',
    params
  })
}

/**
 * 添加加油记录
 */
export function addFuelRecord(data) {
  return request({
    url: '/fuel-record',
    method: 'post',
    data
  })
}

/**
 * 更新加油记录
 */
export function updateFuelRecord(id, data) {
  return request({
    url: `/fuel-record/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除加油记录
 */
export function deleteFuelRecord(id) {
  return request({
    url: `/fuel-record/${id}`,
    method: 'delete'
  })
}

/**
 * 获取维修记录列表
 */
export function getRepairRecordList(params) {
  return request({
    url: '/repair-record',
    method: 'get',
    params
  })
}

/**
 * 添加维修记录
 */
export function addRepairRecord(data) {
  return request({
    url: '/repair-record',
    method: 'post',
    data
  })
}

/**
 * 更新维修记录
 */
export function updateRepairRecord(id, data) {
  return request({
    url: `/repair-record/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除维修记录
 */
export function deleteRepairRecord(id) {
  return request({
    url: `/repair-record/${id}`,
    method: 'delete'
  })
}
