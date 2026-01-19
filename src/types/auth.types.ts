// 认证相关类型定义

export interface LoginDto {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  name: string
  role: 'admin' | 'physician' | 'therapist' | 'nurse'
  department: string
  isActive: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: UserInfo
}
