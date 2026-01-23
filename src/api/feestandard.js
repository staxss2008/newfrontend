import request from '@/utils/request'

/**
 * 获取所有费用标准
 */
export function getAllFeeStandards() {
  return request({
    url: '/fee-standard',
    method: 'get'
  })
}

/**
 * 根据分类获取费用标准
 */
export function getFeeStandardsByCategory(category) {
  return request({
    url: `/fee-standard/category/${category}`,
    method: 'get'
  })
}

/**
 * 根据配置键获取费用标准
 */
export function getFeeStandardByKey(configKey) {
  return request({
    url: `/fee-standard/key/${configKey}`,
    method: 'get'
  })
}

/**
 * 更新费用标准
 */
export function updateFeeStandard(data) {
  return request({
    url: '/fee-standard',
    method: 'put',
    data
  })
}

/**
 * 导入费用标准(CSV格式)
 */
export function importFeeStandardsFromCSV(csvContent) {
  return request({
    url: '/fee-standard/import',
    method: 'post',
    data: csvContent,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

/**
 * 获取费用标准配置Map
 */
export function getFeeStandardConfig() {
  return request({
    url: '/fee-standard/config',
    method: 'get'
  })
}

/**
 * 初始化公休节假日工资标准
 */
export function initHolidayWageStandards() {
  return request({
    url: '/fee-standard/init-holiday-wage',
    method: 'post'
  })
}
