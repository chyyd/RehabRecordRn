/**
 * Auth API 单元测试
 * 基于 axios-mock-adapter 和 Context7 最佳实践
 */

import MockAdapter from 'axios-mock-adapter'
import { authApi } from '@/services/api'
import { apiClient } from '@/services/api/client'

describe('Auth API', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient.client)
    jest.clearAllMocks()
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('login 方法', () => {
    const loginData = {
      username: 'testuser',
      password: 'password123',
    }

    it('应该成功登录', async () => {
      const mockResponse = {
        access_token: 'test-token-123',
        user: {
          id: 1,
          name: '测试用户',
          role: 'therapist',
        },
      }

      mockAxios.onPost('/auth/login').reply(200, mockResponse)

      const response = await authApi.login(loginData)

      expect(response.access_token).toBe(mockResponse.access_token)
      expect(response.user).toEqual(mockResponse.user)
    })

    it('应该处理登录失败', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: '用户名或密码错误',
          },
        },
      }

      mockAxios.onPost('/auth/login').reply(401, mockError.response.data)

      await expect(authApi.login(loginData)).rejects.toMatchObject({
        statusCode: 401,
        message: '用户名或密码错误',
      })
    })

    it('应该处理网络错误', async () => {
      mockAxios.onPost('/auth/login').networkError()

      // 由于重试机制，网络错误会重试3次，最终仍会失败
      await expect(authApi.login(loginData)).rejects.toMatchObject({
        message: 'Network Error',  // axios-mock-adapter的networkError消息
      })
    })
  })

  describe('logout 方法', () => {
    it('应该成功登出', async () => {
      mockAxios.onPost('/auth/logout').reply(200)

      const response = await authApi.logout()

      expect(response).toBeUndefined() // 或者根据实际API返回调整
    })

    it('应该处理登出失败', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            message: '服务器错误',
          },
        },
      }

      mockAxios.onPost('/auth/logout').reply(500, mockError.response.data)

      await expect(authApi.logout()).rejects.toMatchObject({
        statusCode: 500,
        message: '服务器错误',
      })
    })
  })

  describe('getUserProfile 方法', () => {
    it('应该成功获取用户信息', async () => {
      const mockUser = {
        id: 1,
        name: '测试用户',
        role: 'therapist',
      }

      mockAxios.onGet('/auth/profile').reply(200, mockUser)

      const response = await authApi.getUserProfile()

      expect(response).toEqual(mockUser)
    })

    it('应该处理未授权错误', async () => {
      mockAxios.onGet('/auth/profile').reply(401)

      await expect(authApi.getUserProfile()).rejects.toMatchObject({
        statusCode: 401,
      })
    })
  })
})
