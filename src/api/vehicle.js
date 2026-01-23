import request from '@/utils/request'

/**
 * 添加车辆
 */
export function addVehicle(data) {
  return request({
    url: '/vehicle',
    method: 'post',
    data
  })
}

/**
 * 更新车辆信息
 */
export function updateVehicle(id, data) {
  return request({
    url: `/vehicle/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除车辆
 */
export function deleteVehicle(id) {
  return request({
    url: `/vehicle/${id}`,
    method: 'delete'
  })
}

/**
 * 获取车辆列表
 */
export function getVehicleList(params) {
  return request({
    url: '/vehicle',
    method: 'get',
    params
  })
}

/**
 * 获取所有可用车辆列表
 */
export function getAvailableVehicles() {
  return request({
    url: '/vehicle/available',
    method: 'get'
  })
}

/**
 * 根据ID获取车辆信息
 */
export function getVehicleById(id) {
  return request({
    url: `/vehicle/${id}`,
    method: 'get'
  })
}
