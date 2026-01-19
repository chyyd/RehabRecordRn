/**
 * 日志管理工具 - 基于 Context7 最佳实践
 *
 * 功能特性：
 * - 开发环境：完整日志输出
 * - 生产环境：通过Babel插件自动移除
 * - 分级日志：info, warn, error, debug
 * - 性能优化：避免生产环境性能瓶颈
 *
 * Context7 参考：
 * https://reactnative.dev/docs/performance#console-logging
 */

// 日志级别枚举
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

// 日志颜色（开发环境）
const LOG_COLORS = {
  [LogLevel.INFO]: '#2196F3', // 蓝色
  [LogLevel.WARN]: '#FF9800', // 橙色
  [LogLevel.ERROR]: '#F44336', // 红色
  [LogLevel.DEBUG]: '#9E9E9E', // 灰色
}

/**
 * 格式化时间戳
 */
const getTimestamp = (): string => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(
    now.getMilliseconds()
  ).padStart(3, '0')}`
}

/**
 * 格式化日志前缀
 */
const formatPrefix = (level: LogLevel, tag?: string): string => {
  const timestamp = getTimestamp()
  const tagStr = tag ? `[${tag}]` : ''
  return `[${timestamp}] [${level}]${tagStr}`
}

/**
 * Logger 类
 */
class Logger {
  private tag: string

  constructor(tag?: string) {
    this.tag = tag || 'App'
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: any[]): void {
    if (__DEV__) {
      const prefix = formatPrefix(LogLevel.INFO, this.tag)
      console.log(`%c${prefix}`, `color: ${LOG_COLORS[LogLevel.INFO]}`, message, ...args)
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: any[]): void {
    if (__DEV__) {
      const prefix = formatPrefix(LogLevel.WARN, this.tag)
      console.warn(
        `%c${prefix}`,
        `color: ${LOG_COLORS[LogLevel.WARN]}`,
        message,
        ...args
      )
    }
  }

  /**
   * 错误日志
   * 注意：错误日志在生产环境可能需要上报到服务器
   */
  error(message: string, error?: Error | unknown, ...args: any[]): void {
    if (__DEV__) {
      const prefix = formatPrefix(LogLevel.ERROR, this.tag)
      console.error(
        `%c${prefix}`,
        `color: ${LOG_COLORS[LogLevel.ERROR]}`,
        message,
        error || '',
        ...args
      )
    } else {
      // 生产环境：可以将错误上报到服务器（如 Sentry）
      // TODO: 集成错误追踪服务
      // this.reportToServer(message, error)
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: any[]): void {
    if (__DEV__) {
      const prefix = formatPrefix(LogLevel.DEBUG, this.tag)
      console.log(`%c${prefix}`, `color: ${LOG_COLORS[LogLevel.DEBUG]}`, message, ...args)
    }
  }

  /**
   * 网络请求日志
   */
  network(method: string, url: string, data?: any): void {
    if (__DEV__) {
      this.info(`🌐 ${method} ${url}`, data || '')
    }
  }

  /**
   * 网络响应日志
   */
  networkResponse(method: string, url: string, status: number, data?: any): void {
    if (__DEV__) {
      const statusEmoji = status >= 200 && status < 300 ? '✅' : '❌'
      this.info(`${statusEmoji} ${method} ${url} - ${status}`, data || '')
    }
  }

  /**
   * 导航日志
   */
  navigation(from: string, to: string, params?: any): void {
    if (__DEV__) {
      this.info(`🧭 ${from} → ${to}`, params || '')
    }
  }

  /**
   * 状态变化日志
   */
  stateChange(store: string, action: string, prevState: any, nextState: any): void {
    if (__DEV__) {
      this.info(`🔄 [${store}] ${action}`, {
        prev: prevState,
        next: nextState,
      })
    }
  }

  /**
   * 性能日志
   */
  performance(metric: string, value: number, unit: string = 'ms'): void {
    if (__DEV__) {
      this.info(`⚡ ${metric}: ${value}${unit}`)
    }
  }
}

/**
 * 默认Logger实例
 */
export const logger = new Logger()

/**
 * 创建带标签的Logger
 */
export const createLogger = (tag: string): Logger => {
  return new Logger(tag)
}

/**
 * 快捷方法导出
 */
export const log = {
  info: (message: string, ...args: any[]) => logger.info(message, ...args),
  warn: (message: string, ...args: any[]) => logger.warn(message, ...args),
  error: (message: string, error?: Error | unknown, ...args: any[]) =>
    logger.error(message, error, ...args),
  debug: (message: string, ...args: any[]) => logger.debug(message, ...args),
}

export default logger
