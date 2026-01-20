// 患者状态管理
import { create } from 'zustand'
import { patientApi } from '@/services/api'
import { storage } from '@/services/storage/asyncStorage'
import { STORAGE_KEYS } from '@/utils/constants'
import { createLogger } from '@/utils/logger'
import type { Patient, PatientSearchParams } from '@/types'

const logger = createLogger('PatientStore')

interface PatientState {
  // 状态
  patients: Patient[]
  currentPatient: Patient | null
  searchQuery: string
  isLoading: boolean
  isRefreshing: boolean
  lastFetchTime: number | null

  // Actions
  fetchPatients: (params?: PatientSearchParams) => Promise<void>
  searchPatients: (keyword: string) => Promise<void>
  loadPatientsFromCache: () => Promise<void>
  setCurrentPatient: (patient: Patient | null) => void
  refreshPatients: () => Promise<void>
  clearPatients: () => void
}

export const usePatientStore = create<PatientState>((set, get) => ({
  // 初始状态
  patients: [],
  currentPatient: null,
  searchQuery: '',
  isLoading: false,
  isRefreshing: false,
  lastFetchTime: null,

  /**
   * 获取患者列表
   */
  fetchPatients: async (params?: PatientSearchParams) => {
    try {
      set({ isLoading: true })

      const response = await patientApi.getPatients(params)

      // 响应结构: { data: Patient[], total, page, limit, totalPages }
      const patients = response.data || []

      // ✅ P2-2: 先保存到存储，再更新状态（避免竞态条件）
      if (patients.length > 0) {
        await storage.set(STORAGE_KEYS.PATIENTS_CACHE, patients)
      }

      set({
        patients,
        isLoading: false,
        lastFetchTime: Date.now(),
      })

      logger.info(`获取患者列表成功: ${patients.length}条`)
    } catch (error: any) {
      set({ isLoading: false })
      logger.error('获取患者列表失败', error)
      throw error
    }
  },

  /**
   * 搜索患者
   */
  searchPatients: async (keyword: string) => {
    try {
      set({ searchQuery: keyword, isLoading: true })

      if (!keyword.trim()) {
        // 关键词为空，获取所有患者
        const response = await patientApi.getPatients()
        const patients = response.data || []
        set({ patients })
      } else {
        // 搜索患者
        const results = await patientApi.searchPatients(keyword)
        set({ patients })
      }

      set({ isLoading: false })
    } catch (error: any) {
      set({ isLoading: false })
      logger.error('搜索患者失败', error)
      throw error
    }
  },

  /**
   * 从本地缓存加载患者列表
   */
  loadPatientsFromCache: async () => {
    try {
      const cached = await storage.get<Patient[]>(STORAGE_KEYS.PATIENTS_CACHE)

      if (cached && cached.length > 0) {
        set({ patients: cached })
        logger.info(`从缓存加载患者列表: ${cached.length}条`)
      }
    } catch (error) {
      logger.error('加载缓存失败', error)
    }
  },

  /**
   * 设置当前患者
   */
  setCurrentPatient: (patient: Patient | null) => {
    set({ currentPatient: patient })
  },

  /**
   * 刷新患者列表
   */
  refreshPatients: async () => {
    try {
      set({ isRefreshing: true })
      const response = await patientApi.getPatients()
      const patients = response.data || []

      // ✅ P2-2: 先更新缓存，再更新状态
      await storage.set(STORAGE_KEYS.PATIENTS_CACHE, patients)

      set({
        patients: patients,
        isRefreshing: false,
        lastFetchTime: Date.now(),
      })

      logger.info('刷新患者列表成功')
    } catch (error: any) {
      set({ isRefreshing: false })
      logger.error('刷新患者列表失败', error)
      throw error
    }
  },

  /**
   * 清空患者列表
   */
  clearPatients: () => {
    set({
      patients: [],
      currentPatient: null,
      searchQuery: '',
      lastFetchTime: null,
    })
  },
}))
