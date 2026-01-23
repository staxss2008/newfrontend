import request from '@/utils/request'

/**
 * 获取节假日列表
 */
export function getHolidayList(params) {
  return request({
    url: '/holiday',
    method: 'get',
    params
  })
}

/**
 * 添加节假日
 */
export function addHoliday(data) {
  return request({
    url: '/holiday',
    method: 'post',
    data
  })
}

/**
 * 更新节假日
 */
export function updateHoliday(id, data) {
  return request({
    url: `/holiday/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除节假日
 */
export function deleteHoliday(id) {
  return request({
    url: `/holiday/${id}`,
    method: 'delete'
  })
}

/**
 * 批量导入节假日
 */
export function importHolidays(data) {
  return request({
    url: '/holiday/import',
    method: 'post',
    data
  })
}
