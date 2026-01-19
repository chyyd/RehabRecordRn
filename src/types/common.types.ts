// 通用类型定义

export interface ApiResponse<T = any> {
  data: T
  statusCode: number
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ErrorResponse {
  statusCode: number
  message: string
  error?: string
}

export type NetworkStatus = 'online' | 'offline' | 'unknown'

export interface LoadingState {
  isLoading: boolean
  isRefreshing?: boolean
}
