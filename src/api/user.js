import request from '@/utils/request'

/**
 * 获取用户列表
 */
export function getUserList(params) {
  return request({
    url: '/user',
    method: 'get',
    params
  })
}

/**
 * 添加用户
 */
export function addUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(id, data) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}

/**
 * 重置用户密码
 */
export function resetUserPassword(id, password) {
  return request({
    url: `/user/${id}/password`,
    method: 'put',
    data: { password }
  })
}
