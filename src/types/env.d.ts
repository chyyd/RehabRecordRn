/**
 * 环境变量类型声明
 */
declare module '@env' {
  /**
   * API 基础 URL
   */
  export const API_BASE_URL: string

  /**
   * API 超时时间（毫秒）
   */
  export const API_TIMEOUT: string

  /**
   * 应用环境 (development | staging | production)
   */
  export const APP_ENV: string

  /**
   * 应用名称
   */
  export const APP_NAME: string

  /**
   * 应用版本
   */
  export const APP_VERSION: string

  /**
   * 是否启用调试模式
   */
  export const ENABLE_DEBUG: string

  /**
   * 是否启用离线同步
   */
  export const ENABLE_OFFLINE_SYNC: string
}
