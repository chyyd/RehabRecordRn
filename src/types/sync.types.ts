// 数据同步相关类型定义

export type SyncStatus = 'pending' | 'syncing' | 'success' | 'failed'

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE'

export interface SyncItem {
  id: string // UUID
  type: SyncOperationType
  collection: 'patients' | 'records' | 'projects' // 数据集合
  data: any // 本地数据
  timestamp: number // 时间戳
  status: SyncStatus
  errorMessage?: string
  retryCount?: number
}

export interface SyncQueue {
  items: SyncItem[]
  lastSyncAt?: number
  isSyncing: boolean
}

export interface SyncResult {
  success: boolean
  syncedCount: number
  failedCount: number
  errors?: Array<{
    id: string
    error: string
  }>
}

export interface SyncMetadata {
  lastSyncTimestamp: number
  pendingChangesCount: number
  lastSuccessfulSync?: string
}

export interface ConflictResolution {
  strategy: 'timestamp' | 'server' | 'client' | 'manual'
  resolvedData?: any
  requiresUserConfirmation?: boolean
}
