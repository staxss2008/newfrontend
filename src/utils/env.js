/**
 * 环境判断工具
 */
export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

/**
 * 开发环境下打印日志
 * @param {...any} args 日志参数
 */
export function devLog(...args) {
  if (isDev) {
    console.log(...args)
  }
}

/**
 * 开发环境下打印错误
 * @param {...any} args 错误参数
 */
export function devError(...args) {
  if (isDev) {
    console.error(...args)
  }
}

/**
 * 开发环境下打印警告
 * @param {...any} args 警告参数
 */
export function devWarn(...args) {
  if (isDev) {
    console.warn(...args)
  }
}
