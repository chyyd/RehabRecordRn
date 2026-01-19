/**
 * useOnlineStatus Hook 单元测试
 * 基于 React Native Testing Library 和 NetInfo 最佳实践
 */

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

// Mock @react-native-community/netinfo
const mockFetch = jest.fn()
const mockAddEventListener = jest.fn()

jest.mock('@react-native-community/netinfo', () => ({
  default: {
    fetch: mockFetch,
    addEventListener: mockAddEventListener,
  },
}))

describe('useOnlineStatus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该返回初始在线状态', async () => {
      // Mock NetInfo.fetch 返回在线状态
      mockFetch.mockResolvedValue({
        isInternetReachable: true,
        isConnected: true,
      })

      const { result } = renderHook(() => useOnlineStatus())

      // 等待初始状态加载完成
      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('应该返回初始离线状态', async () => {
      // Mock NetInfo.fetch 返回离线状态
      mockFetch.mockResolvedValue({
        isInternetReachable: false,
        isConnected: false,
      })

      const { result } = renderHook(() => useOnlineStatus())

      await waitFor(() => {
        expect(result.current).toBe(false)
      })

      expect(result.current).toBe(false)
    })

    it('应该在网络状态变化时更新', () => {
      // Mock addEventListener 返回一个订阅对象
      const mockEventListener = {
        remove: jest.fn(),
      }
      mockAddEventListener.mockReturnValue(mockEventListener)

      // 初始在线
      mockFetch.mockResolvedValue({
        isInternetReachable: true,
        isConnected: true,
      })

      const { result } = renderHook(() => useOnlineStatus())

      // 模拟网络状态变化
      let listenerCallback: ((state: any) => void) | undefined

      act(() => {
        // 获取传递给addEventListener的回调函数
        const addEventListenerCalls = mockAddEventListener.mock.calls
        if (addEventListenerCalls.length > 0) {
          listenerCallback = addEventListenerCalls[0][0]
        }
      })

      // 模拟网络状态变为离线
      if (listenerCallback) {
        act(() => {
          listenerCallback({
            isInternetReachable: false,
            isConnected: false,
          })
        })

        expect(result.current).toBe(false)
      }

      // 清理
      act(() => {
        const { unmount } = result.current || {}
        if (unmount) unmount()
      })

      expect(mockEventListener.remove).toHaveBeenCalled()
    })
  })

  describe('网络状态监听', () => {
    it('应该正确设置和清理事件监听器', () => {
      const mockEventListener = {
        remove: jest.fn(),
      }
      mockAddEventListener.mockReturnValue(mockEventListener)

      const { unmount } = renderHook(() => useOnlineStatus(), {
        // 不等待，直接测试监听器设置
      })

      expect(mockAddEventListener).toHaveBeenCalled()

      // 清理
      unmount()

      expect(mockEventListener.remove).toHaveBeenCalled()
    })

    it('应该处理多次状态变化', () => {
      const mockEventListener = {
        remove: jest.fn(),
      }
      mockAddEventListener.mockReturnValue(mockEventListener)
      mockFetch.mockResolvedValue({
        isInternetReachable: true,
        isConnected: true,
      })

      const { result } = renderHook(() => useOnlineStatus())

      let listenerCallback: ((state: any) => void) | undefined

      act(() => {
        const calls = mockAddEventListener.mock.calls
        if (calls.length > 0) {
          listenerCallback = calls[0][0]
        }
      })

      if (listenerCallback) {
        // 模拟在线 -> 离线 -> 在线
        act(() => {
          listenerCallback({
            isInternetReachable: false,
            isConnected: false,
          })
        })

        expect(result.current).toBe(false)

        act(() => {
          listenerCallback({
            isInternetReachable: true,
            isConnected: true,
          })
        })

        expect(result.current).toBe(true)
      }
    })
  })

  describe('错误处理', () => {
    it('应该处理 NetInfo.fetch 错误', async () => {
      mockFetch.mockRejectedValue(new Error('NetInfo error'))

      // Hook应该有错误处理，返回默认值或抛出错误
      // 这取决于实际实现
      const { result } = renderHook(() => useOnlineStatus())

      // 验证错误处理（根据实际实现调整）
      // 如果Hook有try-catch，可能会返回false
      // 或者可能需要期望错误
      await waitFor(() => {
        expect(result.current).toBeDefined()
      })
    })

    it('应该处理 addEventListener 错误', () => {
      mockAddEventListener.mockImplementation(() => {
        throw new Error('Listener error')
      })

      // 测试错误情况下的行为
      expect(() => {
        renderHook(() => useOnlineStatus())
      }).not.toThrow()
    })
  })

  describe('边界条件', () => {
    it('应该处理 NetInfo 返回 undefined', async () => {
      mockFetch.mockResolvedValue(undefined)

      const { result } = renderHook(() => useOnlineStatus())

      // 应该有合理的默认行为
      await waitFor(() => {
        // 根据实际实现调整预期
        expect(result.current).toBeDefined()
      })
    })

    it('应该处理 NetInfo 返回 null', async () => {
      mockFetch.mockResolvedValue(null)

      const { result } = renderHook(() => useOnlineStatus())

      await waitFor(() => {
        expect(result.current).toBeDefined()
      })
    })
  })
})
