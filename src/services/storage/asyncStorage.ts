// AsyncStorage 封装 - 提供类型安全的本地存储操作
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createLogger } from '@/utils/logger'

const logger = createLogger('Storage')

/**
 * 通用存储服务
 */
export const storage = {
  /**
   * 获取存储的数据
   * @param key 存储键
   * @returns 解析后的数据或 null
   */
  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key)
      if (value === null) return null
      return JSON.parse(value) as T
    } catch (error) {
      logger.error(`获取数据失败: ${key}`, error)
      return null
    }
  },

  /**
   * 存储数据（自动 JSON 序列化）
   * @param key 存储键
   * @param value 要存储的值
   */
  set: async <T = any>(key: string, value: T): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem(key, jsonValue)
    } catch (error) {
      logger.error(`存储数据失败: ${key}`, error)
      throw error
    }
  },

  /**
   * 删除指定键的数据
   * @param key 存储键
   */
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key)
    } catch (error) {
      logger.error(`删除数据失败: ${key}`, error)
      throw error
    }
  },

  /**
   * 批量获取多个键的数据
   * @param keys 存储键数组
   * @returns 键值对对象
   */
  getMultiple: async <T = any>(
    keys: string[]
  ): Promise<Record<string, T | null>> => {
    try {
      const values = await AsyncStorage.multiGet(keys)
      const result: Record<string, T | null> = {}

      values.forEach(([key, value]) => {
        result[key] = value === null ? null : (JSON.parse(value) as T)
      })

      return result
    } catch (error) {
      logger.error(`批量获取失败: ${keys.join(', ')}`, error)
      return {}
    }
  },

  /**
   * 批量存储多个键值对
   * @param keyValuePairs 键值对数组 [[key1, value1], [key2, value2]]
   */
  setMultiple: async <T = any>(
    keyValuePairs: [string, T][]
  ): Promise<void> => {
    try {
      const serializedPairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ])
      await AsyncStorage.multiSet(serializedPairs as any)
    } catch (error) {
      logger.error('批量存储失败', error)
      throw error
    }
  },

  /**
   * 批量删除多个键
   * @param keys 存储键数组
   */
  removeMultiple: async (keys: string[]): Promise<void> => {
    try {
      await AsyncStorage.multiRemove(keys)
    } catch (error) {
      logger.error(`批量删除失败: ${keys.join(', ')}`, error)
      throw error
    }
  },

  /**
   * 清空所有存储数据
   * ⚠️ 谨慎使用！
   */
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear()
    } catch (error) {
      logger.error('清空存储失败', error)
      throw error
    }
  },

  /**
   * 获取所有存储的键
   */
  getAllKeys: async (): Promise<string[]> => {
    try {
      return await AsyncStorage.getAllKeys()
    } catch (error) {
      logger.error('获取所有键失败', error)
      return []
    }
  },

  /**
   * 检查键是否存在
   * @param key 存储键
   */
  hasKey: async (key: string): Promise<boolean> => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      return keys.includes(key)
    } catch (error) {
      logger.error(`检查键存在失败: ${key}`, error)
      return false
    }
  },
}

export default storage
