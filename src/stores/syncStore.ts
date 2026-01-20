// 数据同步状态管理
import { create } from 'zustand'
import { storage } from '@/services/storage/asyncStorage'
import { STORAGE_KEYS, SYNC_CONFIG } from '@/utils/constants'
import { createLogger } from '@/utils/logger'
import type { SyncQueue, SyncResult, SyncStatus } from '@/types'
import { SyncStrategy } from '@/services/api/sync.api'

const logger = createLogger('SyncStore')

interface SyncState {
  // 状态
  syncQueue: SyncQueue
  isOnline: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  pendingChangesCount: number

  // Actions
  setOnlineStatus: (isOnline: boolean) => void
  addToSyncQueue: (item: any) => Promise<void>
  removeFromSyncQueue: (itemId: string) => Promise<void>
  startSync: () => Promise<SyncResult>
  clearSyncQueue: () => Promise<void>
  loadSyncQueue: () => Promise<void>
}

export const useSyncStore = create<SyncState>((set, get) => ({
  // 初始状态
  syncQueue: {
    items: [],
    isSyncing: false,
  },
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  pendingChangesCount: 0,

  /**
   * 设置在线状态
   */
  setOnlineStatus: (isOnline: boolean) => {
    const wasOffline = !get().isOnline
    set({ isOnline })

    // 从离线恢复在线，自动触发同步
    if (isOnline && wasOffline && SYNC_CONFIG.AUTO_SYNC_ON_CONNECT) {
      logger.info('网络已恢复，准备同步...')
      get().startSync()
    }
  },

  /**
   * 添加到同步队列
   */
  addToSyncQueue: async (item: any) => {
    const { syncQueue } = get()

    const newItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random()}`,
      status: 'pending' as SyncStatus,
      timestamp: Date.now(),
      retryCount: 0,
    }

    const updatedQueue = {
      ...syncQueue,
      items: [...syncQueue.items, newItem],
    }

    // ✅ P2-2: 先持久化队列，再更新状态
    await storage.set(STORAGE_KEYS.SYNC_QUEUE, updatedQueue)

    set({
      syncQueue: updatedQueue,
      pendingChangesCount: updatedQueue.items.length,
    })

    logger.info(`已添加到同步队列: ${newItem.id}`)
  },

  /**
   * 从同步队列移除
   */
  removeFromSyncQueue: async (itemId: string) => {
    const { syncQueue } = get()

    const updatedQueue = {
      ...syncQueue,
      items: syncQueue.items.filter((item) => item.id !== itemId),
    }

    // ✅ P2-2: 先持久化，再更新状态
    await storage.set(STORAGE_KEYS.SYNC_QUEUE, updatedQueue)

    set({
      syncQueue: updatedQueue,
      pendingChangesCount: updatedQueue.items.length,
    })
  },

  /**
   * 开始同步
   */
  startSync: async (): Promise<SyncResult> => {
    const { syncQueue, isOnline } = get()

    if (!isOnline) {
      logger.warn('网络未连接，无法同步')
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
      }
    }

    if (syncQueue.items.length === 0) {
      logger.info('同步队列为空')
      return {
        success: true,
        syncedCount: 0,
        failedCount: 0,
      }
    }

    try {
      set({ isSyncing: true })

      let syncedCount = 0
      let failedCount = 0
      const errors: Array<{ id: string; error: string }> = []

      // ✅ 使用 SyncStrategy 执行真实的同步逻辑
      const MAX_RETRY = 3

      for (const item of syncQueue.items) {
        try {
          // 执行同步操作
          await SyncStrategy.executeSyncItem(item)

          // 同步成功，从队列中移除
          await get().removeFromSyncQueue(item.id)
          syncedCount++

          logger.info(`同步成功: ${item.id}`)
        } catch (error: any) {
          const updatedItem = {
            ...item,
            retryCount: item.retryCount + 1,
          }

          // 检查是否超过最大重试次数
          if (updatedItem.retryCount >= MAX_RETRY) {
            // 超过重试次数，标记为失败并从队列移除
            failedCount++
            errors.push({
              id: item.id,
              error: error.message || '同步失败（超过最大重试次数）',
            })
            await get().removeFromSyncQueue(item.id)

            logger.error(`同步失败（超过最大重试次数）: ${item.id}`, error)
          } else {
            // 未超过重试次数，更新重试计数
            const queue = get().syncQueue
            const updatedItems = queue.items.map((queueItem) =>
              queueItem.id === item.id ? updatedItem : queueItem
            )

            const updatedQueue = {
              ...queue,
              items: updatedItems,
            }

            await storage.set(STORAGE_KEYS.SYNC_QUEUE, updatedQueue)
            set({ syncQueue: updatedQueue })

            logger.warn(
              `同步失败，等待下次重试 (${updatedItem.retryCount}/${MAX_RETRY}): ${item.id}`,
              error
            )
          }
        }
      }

      const now = Date.now()
      set({
        isSyncing: false,
        lastSyncTime: now,
      })

      // 更新最后同步时间
      await storage.set(STORAGE_KEYS.LAST_SYNC, now)

      logger.info(`同步完成: 成功${syncedCount}条, 失败${failedCount}条`)

      return {
        success: true,
        syncedCount,
        failedCount,
        errors: errors.length > 0 ? errors : undefined,
      }
    } catch (error: any) {
      set({ isSyncing: false })
      logger.error('同步失败', error)
      throw error
    }
  },

  /**
   * 清空同步队列
   */
  clearSyncQueue: async () => {
    const emptyQueue = {
      items: [],
      isSyncing: false,
    }

    // ✅ P2-2: 先持久化，再更新状态
    await storage.set(STORAGE_KEYS.SYNC_QUEUE, emptyQueue)

    set({
      syncQueue: emptyQueue,
      pendingChangesCount: 0,
    })

    logger.info('同步队列已清空')
  },

  /**
   * 从本地加载同步队列
   */
  loadSyncQueue: async () => {
    try {
      const cached = await storage.get<SyncQueue>(STORAGE_KEYS.SYNC_QUEUE)

      if (cached) {
        set({
          syncQueue: cached,
          pendingChangesCount: cached.items.length,
        })

        logger.info(`已加载同步队列: ${cached.items.length}条`)
      }

      // 加载最后同步时间
      const lastSync = await storage.get<number>(STORAGE_KEYS.LAST_SYNC)
      if (lastSync) {
        set({ lastSyncTime: lastSync })
      }
    } catch (error) {
      logger.error('加载同步队列失败', error)
    }
  },
}))
