// 治疗记录相关 API
import { request } from './client'
import { API_ENDPOINTS } from '@/utils/constants'
import type {
  TreatmentRecord,
  TreatmentProject,
  CreateRecordDto,
  UpdateRecordDto,
  RecordSearchParams,
  PaginatedResponse
} from '@/types'

/**
 * 获取治疗记录列表
 */
export const getRecords = async (
  params?: RecordSearchParams
): Promise<PaginatedResponse<TreatmentRecord>> => {
  const response = await request<PaginatedResponse<TreatmentRecord>>({
    method: 'GET',
    url: API_ENDPOINTS.RECORDS,
    params,
  })
  return response.data
}

/**
 * 获取记录详情
 */
export const getRecordDetail = async (id: number): Promise<TreatmentRecord> => {
  const response = await request<TreatmentRecord>({
    method: 'GET',
    url: API_ENDPOINTS.RECORD_DETAIL(id),
  })
  return response.data
}

/**
 * 创建治疗记录
 */
export const createRecord = async (
  data: CreateRecordDto
): Promise<TreatmentRecord> => {
  const response = await request<TreatmentRecord>({
    method: 'POST',
    url: API_ENDPOINTS.RECORDS,
    data,
  })
  return response.data
}

/**
 * 更新治疗记录
 */
export const updateRecord = async (
  data: UpdateRecordDto
): Promise<TreatmentRecord> => {
  const response = await request<TreatmentRecord>({
    method: 'PUT',
    url: API_ENDPOINTS.RECORD_DETAIL(data.id),
    data,
  })
  return response.data
}

/**
 * 删除治疗记录
 */
export const deleteRecord = async (id: number): Promise<void> => {
  await request({
    method: 'DELETE',
    url: API_ENDPOINTS.RECORD_DETAIL(id),
  })
}

/**
 * 获取患者历史记录
 */
export const getPatientHistory = async (
  patientId: number,
  days: number = 7
): Promise<TreatmentRecord[]> => {
  const response = await request<TreatmentRecord[]>({
    method: 'GET',
    url: API_ENDPOINTS.RECORD_HISTORY,
    params: { patientId, days },
  })
  return response.data
}

/**
 * 获取治疗项目列表
 */
export const getProjects = async (): Promise<TreatmentProject[]> => {
  const response = await request<TreatmentProject[]>({
    method: 'GET',
    url: API_ENDPOINTS.PROJECTS,
  })
  return response.data
}

export const recordApi = {
  getRecords,
  getRecordDetail,
  createRecord,
  updateRecord,
  deleteRecord,
  getPatientHistory,
  getProjects,
}
