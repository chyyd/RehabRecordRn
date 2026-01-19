/**
 * useDebounce Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react-native'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('应该返回初始值', () => {
    const { result } = renderHook(() => useDebounce('test', 500))

    expect(result.current).toBe('test')
  })

  it('应该在延迟时间后更新值', () => {
    const { result, rerender } = renderHook(
      (value) => useDebounce(value, 500),
      { initialProps: 'initial' }
    )

    // 更新值
    rerender('updated')

    // 立即检查，值应该没有改变
    expect(result.current).toBe('initial')

    // 快进到延迟时间之前
    act(() => {
      jest.advanceTimersByTime(499)
    })

    expect(result.current).toBe('initial')

    // 快进到延迟时间
    act(() => {
      jest.advanceTimersByTime(1)
    })

    expect(result.current).toBe('updated')
  })

  it('应该重置延迟计时器当值在延迟期间改变时', () => {
    const { result, rerender } = renderHook(
      (value) => useDebounce(value, 500),
      { initialProps: 'initial' }
    )

    // 第一次更新
    rerender('update1')

    // 在延迟期间更新第二次
    act(() => {
      jest.advanceTimersByTime(300)
      rerender('update2')
    })

    // 再等待500ms（从第二次更新开始）
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // 应该是第二次更新的值
    expect(result.current).toBe('update2')
  })

  it('应该使用0延迟立即更新值', () => {
    const { result, rerender } = renderHook(
      (value) => useDebounce(value, 0),
      { initialProps: 'initial' }
    )

    rerender('updated')

    // 0延迟也应该需要推进定时器
    act(() => {
      jest.advanceTimersByTime(0)
      jest.runAllTimers()
    })

    expect(result.current).toBe('updated')
  })

  it('应该处理undefined值', () => {
    const { result } = renderHook(() => useDebounce(undefined, 500))

    expect(result.current).toBeUndefined()
  })
})
