// 离线数据管理 Hook
import { useCallback } from 'react'
import { useSyncStore } from '@/stores/syncStore'
import { storage } from '@/services/storage/asyncStorage'
import { STORAGE_KEYS } from '@/utils/constants'
import { createLogger } from '@/utils/logger'
import type { SyncOperationType } from '@/types'

const logger = createLogger('OfflineData')

export const useOfflineData = () => {
  const { addToSyncQueue, isOnline } = useSyncStore()

  /**
   * 离线保存数据（自动加入同步队列）
   */
  const saveOffline = useCallback(
    async (
      collection: 'patients' | 'records' | 'projects',
      type: SyncOperationType,
      data: any
    ) => {
      try {
        // 1. 保存到本地存储
        const key = `${STORAGE_KEYS.SYNC_QUEUE}_${collection}_${data.id || Date.now()}`
        await storage.set(key, {
          ...data,
          _synced: false,
          _timestamp: Date.now(),
        })

        // 2. 添加到同步队列
        await addToSyncQueue({
          collection,
          type,
          data,
        })

        // 3. 如果在线，立即尝试同步
        if (isOnline) {
          // TODO: 触发同步
        }

        return { success: true }
      } catch (error: any) {
        logger.error('保存失败', error)
        return { success: false, error: error.message }
      }
    },
    [addToSyncQueue, isOnline]
  )

  /**
   * 检查数据是否需要同步
   */
  const needsSync = useCallback(
    async (collection: string, id: number): Promise<boolean> => {
      try {
        const key = `${STORAGE_KEYS.SYNC_QUEUE}_${collection}_${id}`
        const data = await storage.get(key)
        return data?._synced === false
      } catch (error) {
        logger.error('检查同步状态失败', error)
        return false
      }
    },
    []
  )

  return {
    saveOffline,
    needsSync,
  }
}

export default useOfflineData
