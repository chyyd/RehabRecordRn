// 统一导出所有 API 服务
export * from './client'
export * from './auth.api'
export * from './patient.api'
export * from './record.api'

// 默认导出 API 客户端
export { default as apiClient } from './client'
