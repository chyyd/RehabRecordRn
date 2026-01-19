// 治疗记录状态管理
import { create } from 'zustand'
import { recordApi } from '@/services/api'
import { storage } from '@/services/storage/asyncStorage'
import { STORAGE_KEYS } from '@/utils/constants'
import { createLogger } from '@/utils/logger'
import type { TreatmentRecord, TreatmentProject, CreateRecordDto, RecordSearchParams } from '@/types'

const logger = createLogger('RecordStore')

interface RecordState {
  // 状态
  records: TreatmentRecord[]
  currentRecord: TreatmentRecord | null
  projects: TreatmentProject[]
  recentProjects: Array<{ projectId: number; projectName: string; count: number }>
  isLoading: boolean
  isSaving: boolean

  // Actions
  fetchRecords: (params?: RecordSearchParams) => Promise<void>
  fetchProjects: () => Promise<void>
  createRecord: (data: CreateRecordDto) => Promise<TreatmentRecord>
  updateRecord: (id: number, data: Partial<CreateRecordDto>) => Promise<void>
  setCurrentRecord: (record: TreatmentRecord | null) => void
  loadProjectsFromCache: () => Promise<void>
  clearRecords: () => void
}

export const useRecordStore = create<RecordState>((set, get) => ({
  // 初始状态
  records: [],
  currentRecord: null,
  projects: [],
  recentProjects: [],
  isLoading: false,
  isSaving: false,

  /**
   * 获取治疗记录列表
   */
  fetchRecords: async (params?: RecordSearchParams) => {
    try {
      set({ isLoading: true })

      const response = await recordApi.getRecords(params)

      set({
        records: response.data.data,
        isLoading: false,
      })

      logger.info(`获取记录列表成功: ${response.data.data.length}条`)
    } catch (error: any) {
      set({ isLoading: false })
      logger.error('获取记录列表失败', error)
      throw error
    }
  },

  /**
   * 获取治疗项目列表
   */
  fetchProjects: async () => {
    try {
      const projects = await recordApi.getProjects()

      // ✅ P2-2: 先缓存到本地，再更新状态
      await storage.set(STORAGE_KEYS.PROJECTS_CACHE, projects)

      set({ projects })

      logger.info(`获取治疗项目成功: ${projects.length}条`)
    } catch (error: any) {
      logger.error('获取治疗项目失败', error)
      throw error
    }
  },

  /**
   * 创建治疗记录
   */
  createRecord: async (data: CreateRecordDto) => {
    try {
      set({ isSaving: true })

      const record = await recordApi.createRecord(data)

      // 添加到记录列表
      set((state) => ({
        records: [record, ...state.records],
        isSaving: false,
      }))

      // 更新最近使用项目
      get().updateRecentProjects(data.projectId)

      logger.info(`创建记录成功: ${record.id}`)
      return record
    } catch (error: any) {
      set({ isSaving: false })
      logger.error('创建记录失败', error)
      throw error
    }
  },

  /**
   * 更新治疗记录
   */
  updateRecord: async (id: number, data: Partial<CreateRecordDto>) => {
    try {
      set({ isSaving: true })

      const updatedRecord = await recordApi.updateRecord({ id, ...data })

      // 更新记录列表
      set((state) => ({
        records: state.records.map((r) =>
          r.id === id ? updatedRecord : r
        ),
        isSaving: false,
      }))

      logger.info(`更新记录成功: ${id}`)
    } catch (error: any) {
      set({ isSaving: false })
      logger.error('更新记录失败', error)
      throw error
    }
  },

  /**
   * 设置当前记录
   */
  setCurrentRecord: (record: TreatmentRecord | null) => {
    set({ currentRecord: record })
  },

  /**
   * 从本地缓存加载治疗项目
   */
  loadProjectsFromCache: async () => {
    try {
      const cached = await storage.get<TreatmentProject[]>(
        STORAGE_KEYS.PROJECTS_CACHE
      )

      if (cached && cached.length > 0) {
        set({ projects: cached })
        logger.info(`从缓存加载治疗项目: ${cached.length}条`)
      }
    } catch (error) {
      logger.error('加载项目缓存失败', error)
    }
  },

  /**
   * 更新最近使用的项目
   */
  updateRecentProjects: (projectId: number) => {
    const { projects, recentProjects } = get()
    const project = projects.find((p) => p.id === projectId)

    if (!project) return

    const existing = recentProjects.find((p) => p.projectId === projectId)

    if (existing) {
      // 增加使用次数
      set({
        recentProjects: recentProjects.map((p) =>
          p.projectId === projectId
            ? { ...p, count: p.count + 1 }
            : p
        ),
      })
    } else {
      // 添加新项目
      set({
        recentProjects: [
          ...recentProjects,
          { projectId, projectName: project.name, count: 1 },
        ],
      })
    }
  },

  /**
   * 清空记录列表
   */
  clearRecords: () => {
    set({
      records: [],
      currentRecord: null,
    })
  },
}))
