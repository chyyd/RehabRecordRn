/**
 * 数据同步API服务
 * 处理离线数据的批量同步
 */

import { apiClient } from './client'

/**
 * 同步项类型
 */
export interface SyncItem {
  id: string
  collection: 'patients' | 'records' | 'auth'
  type: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retryCount: number
}

/**
 * 同步请求响应
 */
export interface SyncResponse {
  synced: Array<{ id: string; collection: string; type: string }>
  failed: Array<{
    id: string
    error: string
    retryCount: number
  }>
}

/**
 * 批量同步数据到服务器
 *
 * @param items - 待同步的项目列表
 * @returns 同步结果
 */
export async function syncPendingChanges(items: SyncItem[]): Promise<SyncResponse> {
  try {
    const response = await apiClient.post('/sync/batch', {
      items: items.map(item => ({
        id: item.id,
        collection: item.collection,
        operation: item.type,
        data: item.data,
        timestamp: item.timestamp,
      }))
    })

    return response.data
  } catch (error: any) {
    throw new Error(`同步失败: ${error.message}`)
  }
}

/**
 * 单个同步项的处理
 */

/**
 * 创建患者数据同步
 */
export async function syncCreatePatient(patientData: any): Promise<void> {
  await apiClient.post('/patients', patientData)
}

/**
 * 更新患者数据同步
 */
export async function syncUpdatePatient(id: string, patientData: any): Promise<void> {
  await apiClient.put(`/patients/${id}`, patientData)
}

/**
 * 删除患者数据同步
 */
export async function syncDeletePatient(id: string): Promise<void> {
  await apiClient.delete(`/patients/${id}`)
}

/**
 * 创建记录数据同步
 */
export async function syncCreateRecord(recordData: any): Promise<void> {
  await apiClient.post('/records', recordData)
}

/**
 * 更新记录数据同步
 */
export function syncUpdateRecord(id: string, recordData: any): Promise<void> {
  return apiClient.put(`/records/${id}`, recordData)
}

/**
 * 删除记录数据同步
 */
export async function syncDeleteRecord(id: string): Promise<void> {
  await apiClient.delete(`/records/${id}`)
}

/**
 * 同步策略类
 * 根据不同的collection和type调用对应的API
 */
export class SyncStrategy {
  /**
   * 根据同步项执行相应的API调用
   */
  static async executeSyncItem(item: SyncItem): Promise<void> {
    const { collection, type, data } = item

    switch (collection) {
      case 'patients':
        switch (type) {
          case 'create':
            await syncCreatePatient(data)
            break
          case 'update':
            await syncUpdatePatient(data.id, data)
            break
          case 'delete':
            await syncDeletePatient(data.id)
            break
        }
        break

      case 'records':
        switch (type) {
          case 'create':
            await syncCreateRecord(data)
            break
          case 'update':
            await syncUpdateRecord(data.id, data)
            break
          case 'delete':
            await syncDeleteRecord(data.id)
            break
        }
        break

      default:
        throw new Error(`不支持的collection: ${collection}`)
    }
  }
}
