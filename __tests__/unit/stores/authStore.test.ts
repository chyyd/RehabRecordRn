/**
 * AuthStore 单元测试
 */

import { act, renderHook, waitFor } from '@testing-library/react-native'
import { AsyncStorage } from '@react-native-async-storage/async-storage'
import { useAuthStore, selectToken, selectUserInfo, selectIsAuthenticated, selectIsLoading } from '@/stores/authStore'
import { authApi } from '@/services/api'
import { STORAGE_KEYS } from '@/utils/constants'
import type { LoginDto } from '@/types'

// Mock API 模块
jest.mock('@/services/api', () => ({
  authApi: {
    login: jest.fn(),
    logout: jest.fn(),
    getUserProfile: jest.fn(),
  },
}))

const mockAuthApi = authApi as jest.Mocked<typeof authApi>

describe('AuthStore', () => {
  beforeEach(() => {
    // 清除所有 mocks
    jest.clearAllMocks()

    // 设置默认的 AsyncStorage mock 返回值
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined)

    // 重置 store 状态
    useAuthStore.getState().logout()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.token).toBeNull()
      expect(result.current.userInfo).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('init 方法', () => {
    it('应该从 AsyncStorage 恢复认证状态', async () => {
      const mockToken = 'test-token'
      const mockUserInfo = { id: 1, name: '测试用户', role: 'therapist' }

      ;(AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(mockToken) // AUTH_TOKEN
        .mockResolvedValueOnce(JSON.stringify(mockUserInfo)) // USER_INFO

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.init()
      })

      expect(result.current.token).toBe(mockToken)
      expect(result.current.userInfo).toEqual(mockUserInfo)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('当没有本地认证信息时应该保持未认证状态', async () => {
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.init()
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBeNull()
      expect(result.current.userInfo).toBeNull()
    })

    it('应该处理 AsyncStorage 错误', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      ;(AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'))

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.init()
      })

      expect(result.current.isAuthenticated).toBe(false)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('login 方法', () => {
    const mockCredentials: LoginDto = {
      username: 'testuser',
      password: 'password123',
    }

    const mockLoginResponse = {
      access_token: 'new-token',
      user: {
        id: 1,
        name: '测试用户',
        role: 'therapist',
      },
    }

    it('应该成功登录并更新状态', async () => {
      mockAuthApi.login.mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login(mockCredentials)
      })

      expect(result.current.token).toBe(mockLoginResponse.access_token)
      expect(result.current.userInfo).toEqual(mockLoginResponse.user)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)

      expect(mockAuthApi.login).toHaveBeenCalledWith(mockCredentials)
      expect(mockAuthApi.login).toHaveBeenCalledTimes(1)
    })

    it('登录失败时应该清除加载状态', async () => {
      const mockError = new Error('登录失败')
      mockAuthApi.login.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await expect(result.current.login(mockCredentials)).rejects.toThrow('登录失败')
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('应该在登录期间设置加载状态', async () => {
      mockAuthApi.login.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockLoginResponse), 100)
          })
      )

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.login(mockCredentials)
      })

      // 立即检查加载状态
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('logout 方法', () => {
    it('应该成功登出并清除状态', async () => {
      // 先设置登录状态
      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.init()
        useAuthStore.setState({
          token: 'test-token',
          userInfo: { id: 1, name: '测试用户', role: 'therapist' },
          isAuthenticated: true,
        })
      })

      expect(result.current.isAuthenticated).toBe(true)

      mockAuthApi.logout.mockClear()
      mockAuthApi.logout.mockResolvedValue(undefined)

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.token).toBeNull()
      expect(result.current.userInfo).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)

      expect(mockAuthApi.logout).toHaveBeenCalledTimes(1)
    })

    it('即使 API 调用失败也应该清除本地状态', async () => {
      const { result } = renderHook(() => useAuthStore())

      // 设置登录状态
      useAuthStore.setState({
        token: 'test-token',
        userInfo: { id: 1, name: '测试用户', role: 'therapist' },
        isAuthenticated: true,
      })

      mockAuthApi.logout.mockRejectedValue(new Error('API错误'))

      await act(async () => {
        try {
          await result.current.logout()
        } catch (error) {
          // 预期会抛出错误
        }
      })

      // 本地状态应该仍然被清除
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.token).toBeNull()
    })
  })

  describe('updateUserInfo 方法', () => {
    it('应该更新用户信息', () => {
      const { result } = renderHook(() => useAuthStore())

      const newUserInfo = {
        id: 1,
        name: '新用户名',
        role: 'doctor',
      }

      act(() => {
        result.current.updateUserInfo(newUserInfo)
      })

      expect(result.current.userInfo).toEqual(newUserInfo)
    })
  })

  describe('setLoading 方法', () => {
    it('应该设置加载状态', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('选择器', () => {
    it('selectToken 应该返回 token', () => {
      const token = 'test-token'
      useAuthStore.setState({ token })

      expect(selectToken(useAuthStore.getState())).toBe(token)
    })

    it('selectUserInfo 应该返回 userInfo', () => {
      const userInfo = { id: 1, name: '测试用户', role: 'therapist' }
      useAuthStore.setState({ userInfo })

      expect(selectUserInfo(useAuthStore.getState())).toEqual(userInfo)
    })

    it('selectIsAuthenticated 应该返回 isAuthenticated', () => {
      useAuthStore.setState({ isAuthenticated: true })

      expect(selectIsAuthenticated(useAuthStore.getState())).toBe(true)
    })

    it('selectIsLoading 应该返回 isLoading', () => {
      useAuthStore.setState({ isLoading: true })

      expect(selectIsLoading(useAuthStore.getState())).toBe(true)
    })
  })
})
