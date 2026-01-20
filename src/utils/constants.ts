// 应用常量定义
// 暂时注释掉@env导入以支持测试环境
// import { API_BASE_URL, API_TIMEOUT, APP_ENV, ENABLE_DEBUG, ENABLE_OFFLINE_SYNC } from '@env'

// 测试环境默认值
// Android 模拟器使用 10.0.2.2 访问宿主机 localhost
const API_BASE_URL = 'http://10.0.2.2:3000'
const API_TIMEOUT = '10000'
const APP_ENV = 'development'
const ENABLE_DEBUG = 'true'
const ENABLE_OFFLINE_SYNC = 'true'

// API 配置
export const API_CONFIG = {
  get BASE_URL() {
    // 返回默认值，实际使用时会从AsyncStorage读取用户设置
    return API_BASE_URL
  },
  TIMEOUT: parseInt(API_TIMEOUT, 10) || 10000, // 10秒超时
}

// 应用配置
export const APP_CONFIG = {
  ENV: APP_ENV || 'development',
  ENABLE_DEBUG: ENABLE_DEBUG === 'true',
  ENABLE_OFFLINE_SYNC: ENABLE_OFFLINE_SYNC !== 'false', // 默认启用
}

// 存储键值
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@rehab/auth_token',
  USER_INFO: '@rehab/user_info',
  PATIENTS_CACHE: '@rehab/patients_cache',
  RECORDS_CACHE: '@rehab/records_cache',
  PROJECTS_CACHE: '@rehab/projects_cache',
  SYNC_QUEUE: '@rehab/sync_queue',
  LAST_SYNC: '@rehab/last_sync',
  SYNC_METADATA: '@rehab/sync_metadata',
}

// API 端点
export const API_ENDPOINTS = {
  // 认证
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',

  // 患者管理
  PATIENTS: '/patients',
  PATIENT_DETAIL: (id: number) => `/patients/${id}`,
  PATIENT_SEARCH: '/patients/search',

  // 治疗记录
  RECORDS: '/records',
  RECORD_DETAIL: (id: number) => `/records/${id}`,
  RECORD_HISTORY: '/records/history',

  // 治疗项目
  PROJECTS: '/projects',
} as const

// 网络状态
export const NETWORK_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown',
} as const

// 同步配置
export const SYNC_CONFIG = {
  RETRY_LIMIT: 3, // 失败重试次数
  RETRY_DELAY: 5000, // 重试延迟（毫秒）
  AUTO_SYNC_ON_CONNECT: true, // 联网自动同步
}
