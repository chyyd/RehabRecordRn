/**
 * 网络请求重试工具 - 基于指数退避算法
 *
 * Context7 参考：
 * Axios retry best practices with exponential backoff
 *
 * 特性：
 * - 指数退避：每次重试延迟时间翻倍
 * - 最大重试次数限制
 * - 可配置的重试条件
 * - 抖动支持：避免雷鸣羊群问题
 */

import { createLogger } from '@/utils/logger'

const logger = createLogger('Retry')

export interface RetryOptions {
  /**
   * 最大重试次数
   * @default 3
   */
  maxRetries?: number

  /**
   * 初始重试延迟（毫秒）
   * @default 1000
   */
  initialDelay?: number

  /**
   * 延迟倍数（指数退避）
   * @default 2
   */
  delayMultiplier?: number

  /**
   * 是否启用抖动（随机延迟）
   * @default true
   */
  enableJitter?: boolean

  /**
   * 判断是否应该重试的函数
   * @default 默认重试网络错误和5xx错误
   */
  shouldRetry?: (error: any) => boolean

  /**
   * 重试回调
   */
  onRetry?: (error: any, retryCount: number) => void
}

/**
 * 默认重试配置
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  delayMultiplier: 2,
  enableJitter: true,
  shouldRetry: (error: any) => {
    // 网络错误（无响应）
    if (!error.response) {
      return true
    }

    // 5xx 服务器错误
    const status = error.response?.status
    if (status >= 500 && status < 600) {
      return true
    }

    // 408 请求超时
    if (status === 408) {
      return true
    }

    // 429 太多请求
    if (status === 429) {
      return true
    }

    return false
  },
  onRetry: (error, retryCount) => {
    logger.warn(`重试请求 (${retryCount})`, error.message || '未知错误')
  },
}

/**
 * 计算延迟时间（带抖动）
 */
const calculateDelay = (
  retryCount: number,
  initialDelay: number,
  multiplier: number,
  enableJitter: boolean
): number => {
  const baseDelay = initialDelay * Math.pow(multiplier, retryCount - 1)

  if (!enableJitter) {
    return baseDelay
  }

  // 添加抖动：±25% 随机延迟
  const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1)
  return Math.max(0, baseDelay + jitter)
}

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 带重试的异步函数执行器
 *
 * @param fn 要执行的异步函数
 * @param options 重试配置
 * @returns 函数执行结果
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => await apiClient.get('/data'),
 *   { maxRetries: 3 }
 * )
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: any

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 最后一次尝试失败，不再重试
      if (attempt > opts.maxRetries) {
        logger.error(`达到最大重试次数 (${opts.maxRetries})，放弃重试`)
        throw error
      }

      // 检查是否应该重试
      if (!opts.shouldRetry(error)) {
        logger.debug('错误不符合重试条件，直接抛出')
        throw error
      }

      // 计算延迟时间
      const delayMs = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.delayMultiplier,
        opts.enableJitter
      )

      logger.debug(`等待 ${delayMs}ms 后重试...`)
      opts.onRetry(error, attempt)

      // 延迟后重试
      await delay(delayMs)
    }
  }

  // 理论上不会到达这里，但TypeScript需要
  throw lastError
}

/**
 * 创建带重试的函数包装器
 *
 * @param fn 原始函数
 * @param options 重试配置
 * @returns 带重试功能的函数
 *
 * @example
 * ```typescript
 * const fetchWithRetry = createRetryWrapper(
 *   (url: string) => fetch(url),
 *   { maxRetries: 3 }
 * )
 *
 * await fetchWithRetry('https://api.example.com/data')
 * ```
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options)
  }) as T
}

/**
 * Axios 请求重试拦截器
 *
 * @param options 重试配置
 * @returns Axios拦截器配置对象
 *
 * @example
 * ```typescript
 * import Axios from 'axios'
 *
 * const client = Axios.create()
 * client.interceptors.response.use(
 *   undefined,
 *   createAxiosRetryInterceptor({ maxRetries: 3 })
 * )
 * ```
 */
export function createAxiosRetryInterceptor(options: RetryOptions = {}) {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }

  return async (error: any) => {
    const config = error.config

    // 如果没有配置对象或已设置重试标志，直接抛出错误
    if (!config || config.__retryCount >= opts.maxRetries) {
      return Promise.reject(error)
    }

    // 检查是否应该重试
    if (!opts.shouldRetry(error)) {
      return Promise.reject(error)
    }

    // 初始化重试计数
    config.__retryCount = config.__retryCount || 0
    config.__retryCount++

    // 计算延迟时间
    const delayMs = calculateDelay(
      config.__retryCount,
      opts.initialDelay,
      opts.delayMultiplier,
      opts.enableJitter
    )

    logger.debug(`Axios请求将在 ${delayMs}ms 后重试 (${config.__retryCount}/${opts.maxRetries})`)

    // 延迟后重试
    await new Promise((resolve) => setTimeout(resolve, delayMs))

    // 重新发起请求
    return config.requestAdapter ?? config.httpAdapter ?? config.adapter
  }
}

export default retryWithBackoff
