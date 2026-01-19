/**
 * Retry 工具函数单元测试
 */

import { retryWithBackoff, createRetryWrapper } from '@/utils/retry'

describe('retryWithBackoff', () => {
  // 不使用fake timers，因为retry.ts中的delay函数使用setTimeout
  // 我们使用较短的延迟时间来加快测试

  describe('基本功能', () => {
    it('应该在第一次成功时返回结果', async () => {
      const mockFn = jest.fn().mockResolvedValue('success')

      const result = await retryWithBackoff(mockFn)

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('应该在失败后重试并最终成功', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValue('success')

      const result = await retryWithBackoff(mockFn, {
        maxRetries: 3,
        initialDelay: 100,
        delayMultiplier: 2,
        enableJitter: false,
      })

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(3)
    })

    it('应该在达到最大重试次数后抛出错误', async () => {
      const mockError = new Error('Permanent error')
      const mockFn = jest.fn().mockRejectedValue(mockError)

      await expect(
        retryWithBackoff(mockFn, {
          maxRetries: 2,
          initialDelay: 100,
        })
      ).rejects.toThrow('Permanent error')

      expect(mockFn).toHaveBeenCalledTimes(3) // 初始调用 + 2次重试
    })
  })

  describe('重试条件', () => {
    it('应该重试网络错误（无响应）', async () => {
      const mockError = new Error('Network Error')
      const mockFn = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue('success')

      const result = await retryWithBackoff(mockFn, { maxRetries: 1 })

      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('应该重试 5xx 服务器错误', async () => {
      const mockError = { response: { status: 500 } }
      const mockFn = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue('success')

      const result = await retryWithBackoff(mockFn, { maxRetries: 1 })

      expect(result).toBe('success')
    })

    it('应该重试 408 请求超时', async () => {
      const mockError = { response: { status: 408 } }
      const mockFn = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue('success')

      const result = await retryWithBackoff(mockFn, { maxRetries: 1 })

      expect(result).toBe('success')
    })

    it('应该重试 429 太多请求', async () => {
      const mockError = { response: { status: 429 } }
      const mockFn = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue('success')

      const result = await retryWithBackoff(mockFn, { maxRetries: 1 })

      expect(result).toBe('success')
    })

    it('不应该重试 4xx 客户端错误（408和429除外）', async () => {
      const mockError = { response: { status: 400 } }
      const mockFn = jest.fn().mockRejectedValue(mockError)

      await expect(
        retryWithBackoff(mockFn, { maxRetries: 3 })
      ).rejects.toEqual(mockError)

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('自定义重试条件', () => {
    it('应该使用自定义 shouldRetry 函数', async () => {
      const mockError = new Error('Custom error')
      const mockFn = jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue('success')

      const customShouldRetry = jest.fn().mockReturnValue(true)

      await retryWithBackoff(mockFn, {
        maxRetries: 1,
        shouldRetry: customShouldRetry,
      })

      // shouldRetry只接收error参数，不接收retryCount
      expect(customShouldRetry).toHaveBeenCalledWith(mockError)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('当 shouldRetry 返回 false 时不应该重试', async () => {
      const mockError = new Error('Custom error')
      const mockFn = jest.fn().mockRejectedValue(mockError)

      await expect(
        retryWithBackoff(mockFn, {
          maxRetries: 3,
          shouldRetry: () => false,
        })
      ).rejects.toThrow('Custom error')

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('延迟计算', () => {
    it('应该使用指数退避计算延迟', async () => {
      const delays: number[] = []
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockRejectedValueOnce(new Error('Error 3'))
        .mockResolvedValue('success')

      // Mock delay 函数来记录延迟时间
      const originalSetTimeout = global.setTimeout
      global.setTimeout = jest.fn((callback, delay) => {
        delays.push(delay as number)
        return originalSetTimeout(callback, 0) // 立即执行
      }) as any

      await retryWithBackoff(mockFn, {
        maxRetries: 3,
        initialDelay: 100,
        delayMultiplier: 2,
        enableJitter: false,
      })

      // 检查延迟序列：100, 200, 400
      expect(delays).toEqual([100, 200, 400])

      global.setTimeout = originalSetTimeout
    })

    it('应该添加抖动到延迟时间', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValue('success')

      // Mock setTimeout 但不实际延迟
      const originalSetTimeout = global.setTimeout
      global.setTimeout = jest.fn((callback) => {
        return originalSetTimeout(callback, 0)
      }) as any

      await retryWithBackoff(mockFn, {
        maxRetries: 1,
        initialDelay: 100,
        enableJitter: true,
      })

      // 只验证函数被调用，具体值由随机数决定
      expect(global.setTimeout).toHaveBeenCalled()

      global.setTimeout = originalSetTimeout
    })
  })

  describe('onRetry 回调', () => {
    it('应该在每次重试时调用 onRetry 回调', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValue('success')

      const onRetryCallback = jest.fn()

      await retryWithBackoff(mockFn, {
        maxRetries: 3,
        onRetry: onRetryCallback,
      })

      expect(onRetryCallback).toHaveBeenCalledTimes(2)
      expect(onRetryCallback).toHaveBeenCalledWith(
        new Error('Error 1'),
        1
      )
      expect(onRetryCallback).toHaveBeenCalledWith(
        new Error('Error 2'),
        2
      )
    })
  })
})

describe('createRetryWrapper', () => {
  it('应该创建带重试功能的函数', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValue('success')

    const wrappedFn = createRetryWrapper(mockFn, {
      maxRetries: 1,
      initialDelay: 100,
    })

    const result = await wrappedFn()

    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('应该保留原始函数的参数', async () => {
    const mockFn = jest.fn().mockResolvedValue('success')

    const wrappedFn = createRetryWrapper((a: number, b: string) => mockFn(a, b), {
      maxRetries: 0,
    })

    await wrappedFn(1, 'test')

    expect(mockFn).toHaveBeenCalledWith(1, 'test')
  })
})
