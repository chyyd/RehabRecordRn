// 认证相关 API
import { request } from './client'
import { API_ENDPOINTS } from '@/utils/constants'
import type {
  LoginDto,
  LoginResponse,
  UserInfo
} from '@/types'

/**
 * 用户登录
 */
export const login = async (credentials: LoginDto): Promise<LoginResponse> => {
  const response = await request<LoginResponse>({
    method: 'POST',
    url: API_ENDPOINTS.LOGIN,
    data: credentials,
  })
  return response.data
}

/**
 * 用户登出
 */
export const logout = async (): Promise<void> => {
  await request({
    method: 'POST',
    url: API_ENDPOINTS.LOGOUT,
  })
}

/**
 * 获取当前用户信息
 */
export const getUserProfile = async (): Promise<UserInfo> => {
  const response = await request<UserInfo>({
    method: 'GET',
    url: API_ENDPOINTS.PROFILE,
  })
  return response.data
}

export const authApi = {
  login,
  logout,
  getUserProfile,
}
