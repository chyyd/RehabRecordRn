/**
 * Jest 测试环境设置
 */

// 导入 jest-native 扩展
import '@testing-library/jest-native/extend-expect'

// 导入 jest-extended 扩展
import * as jestExtended from 'jest-extended'

// 启用 jest-extended 扩展
expect.extend(jestExtended)

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  AsyncStorage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
  },
}))

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')

// Mock @react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }) => children,
}))

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react')
  return {
    ...require('react-native-paper'),
    Portal: ({ children }) => children,
    Dialog: ({ visible, onDismiss, children }) =>
      visible ? React.createElement('div', { onDismiss }, children) : null,
  }
})

// 全局测试前设置
beforeEach(() => {
  // 清除所有 mock 的调用记录
  jest.clearAllMocks()
})

// 静默 console.warn（生产环境不会有警告）
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}

// 设置测试超时时间
jest.setTimeout(10000)
