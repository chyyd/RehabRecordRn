// API 客户端封装
// 使用方法：在导入此模块后使用 request 函数发起 API 请求

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG, STORAGE_KEYS } from '@/utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainerRef } from '@react-navigation/native'
import { createLogger } from '@/utils/logger'
import { retryWithBackoff } from '@/utils/retry'
import type {
  ApiResponse,
  ErrorResponse
} from '@/types'

const logger = createLogger('ApiClient')

// 保存导航引用用于401跳转
let navigationRef: NavigationContainerRef<any> | null = null

export const setNavigationRef = (ref: NavigationContainerRef<any> | null) => {
  navigationRef = ref
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  delayMultiplier: 2,
  enableJitter: true,
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    // 请求拦截器：自动注入 Token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        logger.network(config.method?.toUpperCase() || 'GET', config.url || '')
        return config
      },
      (error) => {
        logger.error('请求错误', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器：统一处理错误
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.networkResponse(
          response.config.method?.toUpperCase() || 'GET',
          response.config.url || '',
          response.status
        )
        return response
      },
      async (error) => {
        const { response } = error

        if (response) {
          // 服务端返回错误
          const errorResponse: ErrorResponse = {
            statusCode: response.status,
            message: response.data?.message || '请求失败',
            error: response.data?.error,
          }

          // 401 未授权：清除 Token 并跳转登录
          if (response.status === 401) {
            await this.clearAuth()
            logger.warn('Token 已过期，请重新登录')

            // ✅ P1-2: 实现401跳转逻辑
            if (navigationRef) {
              navigationRef.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              })
            }
          }

          logger.error('响应错误', errorResponse)
          return Promise.reject(errorResponse)
        }

        // 网络错误
        const networkError: ErrorResponse = {
          statusCode: 0,
          message: error.message || '网络连接失败',
        }

        if (error.code === 'ECONNABORTED') {
          networkError.message = '请求超时，请检查网络连接'
        }

        logger.error('网络错误', networkError)
        return Promise.reject(networkError)
      }
    )
  }

  /**
   * 清除认证信息
   */
  private async clearAuth() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_INFO,
    ])
  }

  /**
   * 发起 GET 请求（带重试）
   */
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await retryWithBackoff(
      async () => await this.client.get<T>(url, config),
      RETRY_CONFIG
    )
    return {
      data: response.data,
      statusCode: response.status,
    }
  }

  /**
   * 发起 POST 请求（带重试）
   */
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await retryWithBackoff(
      async () => await this.client.post<T>(url, data, config),
      RETRY_CONFIG
    )
    return {
      data: response.data,
      statusCode: response.status,
    }
  }

  /**
   * 发起 PUT 请求（带重试）
   */
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await retryWithBackoff(
      async () => await this.client.put<T>(url, data, config),
      RETRY_CONFIG
    )
    return {
      data: response.data,
      statusCode: response.status,
    }
  }

  /**
   * 发起 DELETE 请求（带重试）
   */
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await retryWithBackoff(
      async () => await this.client.delete<T>(url, config),
      RETRY_CONFIG
    )
    return {
      data: response.data,
      statusCode: response.status,
    }
  }

  /**
   * 发起 PATCH 请求（带重试）
   */
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await retryWithBackoff(
      async () => await this.client.patch<T>(url, data, config),
      RETRY_CONFIG
    )
    return {
      data: response.data,
      statusCode: response.status,
    }
  }
}

// 导出单例
export const apiClient = new ApiClient()

/**
 * 便捷的请求函数
 * @example
 * const response = await request<LoginResponse>({
 *   method: 'POST',
 *   url: '/auth/login',
 *   data: { username, password }
 * })
 */
export async function request<T = any>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const { method = 'GET', url, data, ...restConfig } = config

  switch (method.toUpperCase()) {
    case 'GET':
      return apiClient.get<T>(url as string, restConfig)
    case 'POST':
      return apiClient.post<T>(url as string, data, restConfig)
    case 'PUT':
      return apiClient.put<T>(url as string, data, restConfig)
    case 'DELETE':
      return apiClient.delete<T>(url as string, restConfig)
    case 'PATCH':
      return apiClient.patch<T>(url as string, data, restConfig)
    default:
      throw new Error(`不支持的请求方法: ${method}`)
  }
}

export default apiClient
