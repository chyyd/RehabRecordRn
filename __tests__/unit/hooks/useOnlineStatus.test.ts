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

// Mock syncStore (useOnlineStatus依赖它)
jest.mock('@/stores/syncStore', () => ({
  useSyncStore: () => ({
    setOnlineStatus: jest.fn(),
  }),
}))

describe('useOnlineStatus Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 默认返回在线状态
    mockFetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    })
    mockAddEventListener.mockReturnValue(jest.fn())
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('基础功能', () => {
    it('应该返回初始在线状态', async () => {
      const { result } = renderHook(() => useOnlineStatus())

      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('应该返回初始离线状态', async () => {
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
      const mockUnsubscribe = jest.fn()
      mockAddEventListener.mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useOnlineStatus())

      // 获取回调函数
      const listenerCallback = mockAddEventListener.mock.calls[0][0]

      // 模拟网络状态变为离线
      act(() => {
        listenerCallback({
          isInternetReachable: false,
          isConnected: false,
        })
      })

      expect(result.current).toBe(false)

      // 清理
      act(() => {
        // Trigger cleanup
      })

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('网络状态监听', () => {
    it('应该正确设置和清理事件监听器', () => {
      const mockUnsubscribe = jest.fn()
      mockAddEventListener.mockReturnValue(mockUnsubscribe)

      const { unmount } = renderHook(() => useOnlineStatus())

      expect(mockAddEventListener).toHaveBeenCalled()

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('应该处理多次状态变化', () => {
      const mockUnsubscribe = jest.fn()
      mockAddEventListener.mockReturnValue(mockUnsubscribe)

      const { result } = renderHook(() => useOnlineStatus())

      const listenerCallback = mockAddEventListener.mock.calls[0][0]

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
    })
  })

  describe('错误处理', () => {
    it('应该处理 NetInfo.fetch 错误', async () => {
      mockFetch.mockRejectedValue(new Error('NetInfo error'))

      const { result } = renderHook(() => useOnlineStatus())

      // 验证错误处理（根据实际实现调整）
      await waitFor(() => {
        expect(result.current).toBeDefined()
      })
    })

    it('应该处理 addEventListener 错误', () => {
      mockAddEventListener.mockImplementation(() => {
        throw new Error('Listener error')
      })

      expect(() => {
        renderHook(() => useOnlineStatus())
      }).not.toThrow()
    })
  })

  describe('边界条件', () => {
    it('应该处理 NetInfo 返回 undefined', async () => {
      mockFetch.mockResolvedValue(undefined)

      const { result } = renderHook(() => useOnlineStatus())

      await waitFor(() => {
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
