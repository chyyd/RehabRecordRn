// 认证状态管理 - 符合 Context7 最佳实践
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AsyncStorage } from '@react-native-async-storage/async-storage'
import { authApi } from '@/services/api'
import { STORAGE_KEYS } from '@/utils/constants'
import { createLogger } from '@/utils/logger'
import type { LoginDto, UserInfo } from '@/types'

const logger = createLogger('AuthStore')

// ============================================================
// AsyncStorage 适配器 - 符合 Zustand persist 接口
// ============================================================

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return await AsyncStorage.getItem(name)
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name)
  },
}

// ============================================================
// 状态定义
// ============================================================

interface AuthState {
  // 状态
  token: string | null
  userInfo: UserInfo | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  init: () => Promise<void>
  login: (credentials: LoginDto) => Promise<void>
  logout: () => Promise<void>
  updateUserInfo: (info: UserInfo) => void
  setLoading: (loading: boolean) => void
}

// ============================================================
// Store 创建 - 使用正确的 persist 配置
// ============================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      token: null,
      userInfo: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * 初始化：从持久化存储恢复认证状态
       */
      init: async () => {
        try {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
          const userInfoStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO)
          const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null

          if (token && userInfo) {
            set({
              token,
              userInfo,
              isAuthenticated: true,
            })
            logger.info('已从本地存储恢复认证状态')
          } else {
            set({ isAuthenticated: false })
            logger.info('无本地认证信息')
          }
        } catch (e) {
          logger.error('初始化失败', e)
        }
      },

      /**
       * 用户登录
       */
      login: async (credentials: LoginDto) => {
        try {
          set({ isLoading: true })

          const response = await authApi.login(credentials)
          const { access_token, user } = response

          // 更新状态
          set({
            token: access_token,
            userInfo: user,
            isAuthenticated: true,
            isLoading: false,
          })

          logger.info(`登录成功: ${user.name}`)
        } catch (error: any) {
          set({ isLoading: false })
          logger.error('登录失败', error)
          throw error
        }
      },

      /**
       * 用户登出
       */
      logout: async () => {
        try {
          // 调用登出 API
          await authApi.logout()

          // 清除状态
          set({
            token: null,
            userInfo: null,
            isAuthenticated: false,
          })

          logger.info('登出成功')
        } catch (error: any) {
          logger.error('登出失败', error)
          // 即使 API 调用失败，也清除本地状态
          set({
            token: null,
            userInfo: null,
            isAuthenticated: false,
          })
        }
      },

      /**
       * 更新用户信息
       */
      updateUserInfo: (info: UserInfo) => {
        set({ userInfo: info })
      },

      /**
       * 设置加载状态
       */
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
    }
  )
)

// ============================================================
// 选择器（优化性能，避免不必要的重新渲染）
// ============================================================

export const selectToken = (state: AuthState) => state.token
export const selectUserInfo = (state: AuthState) => state.userInfo
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated
export const selectIsLoading = (state: AuthState) => state.isLoading
