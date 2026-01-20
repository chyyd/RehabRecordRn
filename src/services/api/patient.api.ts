// 患者管理相关 API
import { request } from './client'
import { API_ENDPOINTS } from '@/utils/constants'
import type {
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
  PatientSearchParams,
  PaginatedResponse
} from '@/types'

/**
 * 获取患者列表
 * 注意：后端直接返回数组，而不是分页对象
 */
export const getPatients = async (
  params?: PatientSearchParams
): Promise<PaginatedResponse<Patient>> => {
  const response = await request<Patient[]>({
    method: 'GET',
    url: API_ENDPOINTS.PATIENTS,
    params,
  })

  // 将数组转换为分页对象格式
  return {
    data: response.data,
    total: response.data.length,
    page: 1,
    limit: response.data.length,
    totalPages: 1,
  }
}

/**
 * 搜索患者
 */
export const searchPatients = async (
  keyword: string
): Promise<Patient[]> => {
  const response = await request<Patient[]>({
    method: 'GET',
    url: API_ENDPOINTS.PATIENT_SEARCH,
    params: { keyword },
  })
  return response.data
}

/**
 * 获取患者详情
 */
export const getPatientDetail = async (id: number): Promise<Patient> => {
  const response = await request<Patient>({
    method: 'GET',
    url: API_ENDPOINTS.PATIENT_DETAIL(id),
  })
  return response.data
}

/**
 * 创建患者
 */
export const createPatient = async (
  data: CreatePatientDto
): Promise<Patient> => {
  const response = await request<Patient>({
    method: 'POST',
    url: API_ENDPOINTS.PATIENTS,
    data,
  })
  return response.data
}

/**
 * 更新患者信息
 */
export const updatePatient = async (
  data: UpdatePatientDto
): Promise<Patient> => {
  const response = await request<Patient>({
    method: 'PUT',
    url: API_ENDPOINTS.PATIENT_DETAIL(data.id),
    data,
  })
  return response.data
}

/**
 * 删除患者
 */
export const deletePatient = async (id: number): Promise<void> => {
  await request({
    method: 'DELETE',
    url: API_ENDPOINTS.PATIENT_DETAIL(id),
  })
}

export const patientApi = {
  getPatients,
  searchPatients,
  getPatientDetail,
  createPatient,
  updatePatient,
  deletePatient,
}
