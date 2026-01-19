/**
 * Logger 工具函数单元测试
 */

// 定义 __DEV__ 全局变量
(global as any).__DEV__ = true

import { createLogger, logger } from '@/utils/logger'

// Mock console 方法
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

describe('Logger', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('基础日志功能', () => {
    it('应该在开发环境输出 info 日志', () => {
      const testLogger = createLogger('TestComponent')

      testLogger.info('测试信息', { data: 'test' })

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[INFO]')
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[TestComponent]')
      expect(consoleLogSpy.mock.calls[0][2]).toBe('测试信息')
    })

    it('应该在开发环境输出 warn 日志', () => {
      const testLogger = createLogger('TestComponent')

      testLogger.warn('警告信息')

      expect(consoleWarnSpy).toHaveBeenCalled()
      expect(consoleWarnSpy.mock.calls[0][0]).toContain('[WARN]')
    })

    it('应该在开发环境输出 error 日志', () => {
      const testLogger = createLogger('TestComponent')
      const error = new Error('测试错误')

      testLogger.error('错误信息', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ERROR]')
      expect(consoleErrorSpy.mock.calls[0][2]).toBe('错误信息')
      expect(consoleErrorSpy.mock.calls[0][3]).toBe(error)
    })

    it('应该在开发环境输出 debug 日志', () => {
      const testLogger = createLogger('TestComponent')

      testLogger.debug('调试信息')

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0]).toContain('[DEBUG]')
    })
  })

  describe('专用日志方法', () => {
    it('应该输出网络请求日志', () => {
      logger.network('GET', '/api/patients')

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][2]).toContain('🌐')
      expect(consoleLogSpy.mock.calls[0][2]).toContain('GET')
      expect(consoleLogSpy.mock.calls[0][2]).toContain('/api/patients')
    })

    it('应该输出网络响应日志', () => {
      logger.networkResponse('GET', '/api/patients', 200, { data: [] })

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][2]).toContain('✅')
      expect(consoleLogSpy.mock.calls[0][2]).toContain('200')
    })

    it('应该输出导航日志', () => {
      logger.navigation('Home', 'PatientDetail', { patientId: 1 })

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][2]).toContain('🧭')
      expect(consoleLogSpy.mock.calls[0][2]).toContain('Home → PatientDetail')
    })

    it('应该输出状态变化日志', () => {
      logger.stateChange('authStore', 'login', {}, { token: 'test' })

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][2]).toContain('🔄')
      expect(consoleLogSpy.mock.calls[0][2]).toContain('[authStore]')
      expect(consoleLogSpy.mock.calls[0][2]).toContain('login')
    })

    it('应该输出性能日志', () => {
      logger.performance('API调用', 150, 'ms')

      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][2]).toContain('⚡')
      expect(consoleLogSpy.mock.calls[0][2]).toContain('API调用: 150ms')
    })
  })

  describe('默认 Logger 实例', () => {
    it('应该导出默认 logger 实例', () => {
      expect(logger).toBeDefined()
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.debug).toBe('function')
    })
  })

  describe('快捷方法', () => {
    it('log.info 应该输出信息日志', () => {
      const { log } = require('@/utils/logger')

      log.info('快捷信息日志')

      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('log.warn 应该输出警告日志', () => {
      const { log } = require('@/utils/logger')

      log.warn('快捷警告日志')

      expect(consoleWarnSpy).toHaveBeenCalled()
    })

    it('log.error 应该输出错误日志', () => {
      const { log } = require('@/utils/logger')

      log.error('快捷错误日志')

      expect(consoleErrorSpy).toHaveBeenCalled()
    })
  })
})
