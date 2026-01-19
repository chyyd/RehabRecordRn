/**
 * API Client 单元测试
 */

import MockAdapter from 'axios-mock-adapter'
import { apiClient } from '@/services/api/client'
import { STORAGE_KEYS } from '@/utils/constants'
import { AsyncStorage } from '@react-native-async-storage/async-storage'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage')

describe('ApiClient', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient.client)
    jest.clearAllMocks()
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('GET 请求', () => {
    it('应该成功发起 GET 请求', async () => {
      const mockResponse = { data: { id: 1, name: '测试' } }
      mockAxios.onGet('/test').reply(200, mockResponse)

      const response = await apiClient.get('/test')

      expect(response.statusCode).toBe(200)
      expect(response.data).toEqual(mockResponse)
    })

    it('应该支持重试机制', async () => {
      let attemptCount = 0
      mockAxios.onGet('/test').reply(() => {
        attemptCount++
        if (attemptCount < 3) {
          return [500, { message: 'Server Error' }]
        }
        return [200, { data: 'success' }]
      })

      const response = await apiClient.get('/test')

      expect(attemptCount).toBe(3) // 初始请求 + 2次重试
      expect(response.data).toEqual({ data: 'success' })
    })
  })

  describe('POST 请求', () => {
    it('应该成功发起 POST 请求', async () => {
      const requestData = { name: '测试患者' }
      const mockResponse = { data: { id: 1, ...requestData } }
      mockAxios.onPost('/patients').reply(201, mockResponse)

      const response = await apiClient.post('/patients', requestData)

      expect(response.statusCode).toBe(201)
      expect(response.data).toEqual(mockResponse)
    })
  })

  describe('PUT 请求', () => {
    it('应该成功发起 PUT 请求', async () => {
      const updateData = { name: '更新名称' }
      const mockResponse = { data: { id: 1, ...updateData } }
      mockAxios.onPut('/patients/1').reply(200, mockResponse)

      const response = await apiClient.put('/patients/1', updateData)

      expect(response.statusCode).toBe(200)
      expect(response.data).toEqual(mockResponse)
    })
  })

  describe('DELETE 请求', () => {
    it('应该成功发起 DELETE 请求', async () => {
      mockAxios.onDelete('/patients/1').reply(204)

      const response = await apiClient.delete('/patients/1')

      expect(response.statusCode).toBe(204)
    })
  })

  describe('PATCH 请求', () => {
    it('应该成功发起 PATCH 请求', async () => {
      const patchData = { status: 'completed' }
      const mockResponse = { data: { id: 1, ...patchData } }
      mockAxios.onPatch('/records/1').reply(200, mockResponse)

      const response = await apiClient.patch('/records/1', patchData)

      expect(response.statusCode).toBe(200)
      expect(response.data).toEqual(mockResponse)
    })
  })

  describe('请求拦截器', () => {
    it('应该自动注入 Token 到请求头', async () => {
      const mockToken = 'test-token-123'
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken)

      mockAxios.onGet('/protected').reply((config) => {
        expect(config.headers.Authorization).toBe(`Bearer ${mockToken}`)
        return [200, { data: 'success' }]
      })

      // 等待 AsyncStorage.getItem 完成
      await new Promise((resolve) => setImmediate(resolve))

      const response = await apiClient.get('/protected')

      expect(response.data).toEqual({ data: 'success' })
    })

    it('当没有 Token 时应该继续请求', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)

      mockAxios.onGet('/public').reply((config) => {
        expect(config.headers.Authorization).toBeUndefined()
        return [200, { data: 'success' }]
      })

      const response = await apiClient.get('/public')

      expect(response.data).toEqual({ data: 'success' })
    })
  })

  describe('响应拦截器', () => {
    it('应该处理 401 未授权错误', async () => {
      // Mock navigation
      const mockNavigation = {
        reset: jest.fn(),
      }

      // 设置导航引用
      const { setNavigationRef } = require('@/services/api/client')
      setNavigationRef(mockNavigation as any)

      mockAxios.onGet('/protected').reply(401)

      await expect(apiClient.get('/protected')).rejects.toMatchObject({
        statusCode: 401,
      })

      // 注意：由于测试环境限制，这里主要验证401错误会被抛出
      // 实际的导航跳转需要在集成测试中验证
    })

    it('应该处理网络错误', async () => {
      mockAxios.onGet('/test').networkError()

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        statusCode: 0,
        message: 'Network Error',
      })
    })

    it('应该处理超时错误', async () => {
      mockAxios.onGet('/test').timeout()

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: expect.stringContaining('timeout'),
      })
    })
  })
})
