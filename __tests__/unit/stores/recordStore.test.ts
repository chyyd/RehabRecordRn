/**
 * RecordStore 单元测试
 * 基于 React Native Testing Library 最佳实践
 */

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { AsyncStorage } from '@react-native-async-storage/async-storage'
import { useRecordStore } from '@/stores/recordStore'
import { recordApi } from '@/services/api'
import { STORAGE_KEYS } from '@/utils/constants'
import type { TreatmentRecord, TreatmentProject, CreateRecordDto } from '@/types'

// Mock API
jest.mock('@/services/api', () => ({
  recordApi: {
    getRecords: jest.fn(),
    getProjects: jest.fn(),
    createRecord: jest.fn(),
    updateRecord: jest.fn(),
    getPatientHistory: jest.fn(),
  },
}))

const mockRecordApi = recordApi as jest.Mocked<typeof recordApi>

const mockProjects: TreatmentProject[] = [
  {
    id: 1,
    name: '物理治疗',
    duration: 30,
    price: 100,
  },
  {
    id: 2,
    name: '作业治疗',
    duration: 45,
    price: 150,
  },
]

const mockRecords: TreatmentRecord[] = [
  {
    id: 1,
    projectId: 1,
    project: mockProjects[0],
    therapistId: 1,
    therapist: { id: 1, name: '张治疗师' },
    startTime: '2025-01-19T10:00:00Z',
    durationMinutes: 30,
    status: 'completed',
    notes: '治疗效果良好',
  },
]

describe('RecordStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 重置所有AsyncStorage方法的mock
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

    // 重置store状态（基于Context7最佳实践）
    useRecordStore.setState({
      records: [],
      currentRecord: null,
      projects: [],
      recentProjects: [],
      isLoading: false,
      isSaving: false,
      lastFetchTime: null,
    })
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => useRecordStore())

      expect(result.current.records).toEqual([])
      expect(result.current.currentRecord).toBeNull()
      expect(result.current.projects).toEqual([])
      expect(result.current.recentProjects).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('fetchRecords 方法', () => {
    it('应该成功获取治疗记录列表', async () => {
      mockRecordApi.getRecords.mockResolvedValue({
        data: { data: mockRecords },
        status: 200,
      } as any)

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await result.current.fetchRecords()
      })

      expect(result.current.records).toEqual(mockRecords)
      expect(result.current.isLoading).toBe(false)

      expect(mockRecordApi.getRecords).toHaveBeenCalledTimes(1)
    })

    it('应该支持查询参数', async () => {
      const params = { patientId: 1 }
      mockRecordApi.getRecords.mockResolvedValue({
        data: { data: mockRecords },
        statusCode: 200,
      })

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await result.current.fetchRecords(params)
      })

      expect(mockRecordApi.getRecords).toHaveBeenCalledWith(params)
    })

    it('应该处理获取失败', async () => {
      const mockError = new Error('获取失败')
      mockRecordApi.getRecords.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await expect(result.current.fetchRecords()).rejects.toThrow('获取失败')
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('fetchProjects 方法', () => {
    it('应该成功获取治疗项目列表', async () => {
      mockRecordApi.getProjects.mockResolvedValue(mockProjects as any)

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await result.current.fetchProjects()
      })

      expect(result.current.projects).toEqual(mockProjects)

      // 验证缓存
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PROJECTS_CACHE,
        JSON.stringify(mockProjects)
      )
    })

    it('应该处理获取项目失败', async () => {
      const mockError = new Error('获取失败')
      mockRecordApi.getProjects.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await expect(result.current.fetchProjects()).rejects.toThrow('获取失败')
      })
    })
  })

  describe('createRecord 方法', () => {
    const mockCreateData: CreateRecordDto = {
      projectId: 1,
      patientId: 1,
      startTime: '2025-01-19T10:00:00Z',
      durationMinutes: 30,
      notes: '初次治疗',
    }

    const mockNewRecord: TreatmentRecord = {
      id: 1,
      ...mockCreateData,
      project: mockProjects[0],
      therapistId: 1,
      therapist: { id: 1, name: '张治疗师' },
      status: 'pending',
    }

    it('应该成功创建治疗记录', async () => {
      mockRecordApi.createRecord.mockResolvedValue(mockNewRecord)

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        const created = await result.current.createRecord(mockCreateData)
      })

      expect(result.current.records).toContainEqual(mockNewRecord)
      expect(result.current.isSaving).toBe(false)

      expect(mockRecordApi.createRecord).toHaveBeenCalledWith(mockCreateData)
    })

    it('应该更新最近使用的项目', async () => {
      mockRecordApi.createRecord.mockResolvedValue(mockNewRecord)
      mockRecordApi.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useRecordStore())

      // 先获取项目列表
      await act(async () => {
        await result.current.fetchProjects()
      })

      await act(async () => {
        await result.current.createRecord(mockCreateData)
      })

      // 验证最近项目已更新
      const recentProject = result.current.recentProjects.find(
        (p) => p.projectId === mockCreateData.projectId
      )
      expect(recentProject).toBeDefined()
      expect(recentProject?.count).toBe(1)
    })

    it('应该处理创建失败', async () => {
      const mockError = new Error('创建失败')
      mockRecordApi.createRecord.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await expect(result.current.createRecord(mockCreateData)).rejects.toThrow('创建失败')
      })

      expect(result.current.isSaving).toBe(false)
    })

    it('应该在创建期间设置加载状态', async () => {
      mockRecordApi.createRecord.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockNewRecord), 100)
          })
      )

      const { result } = renderHook(() => useRecordStore())

      act(() => {
        result.current.createRecord(mockCreateData)
      })

      expect(result.current.isSaving).toBe(true)

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false)
      })
    })
  })

  describe('updateRecord 方法', () => {
    const updateData = {
      notes: '更新后的备注',
      status: 'completed' as const,
    }

    const updatedRecord: TreatmentRecord = {
      ...mockRecords[0],
      ...updateData,
    }

    it('应该成功更新治疗记录', async () => {
      mockRecordApi.updateRecord.mockResolvedValue(updatedRecord)

      const { result } = renderHook(() => useRecordStore())

      // 先设置初始记录
      act(() => {
        useRecordStore.setState({ records: mockRecords })
      })

      await act(async () => {
        await result.current.updateRecord(1, updateData)
      })

      expect(result.current.records[0]).toEqual(updatedRecord)
      expect(result.current.isSaving).toBe(false)

      expect(mockRecordApi.updateRecord).toHaveBeenCalledWith({
        id: 1,
        ...updateData,
      })
    })

    it('应该处理更新失败', async () => {
      const mockError = new Error('更新失败')
      mockRecordApi.updateRecord.mockRejectedValue(mockError)

      const { result } = renderHook(() => useRecordStore())

      act(() => {
        useRecordStore.setState({ records: mockRecords })
      })

      await act(async () => {
        await expect(result.current.updateRecord(1, updateData)).rejects.toThrow('更新失败')
      })

      expect(result.current.isSaving).toBe(false)
    })
  })

  describe('setCurrentRecord 方法', () => {
    it('应该设置当前记录', () => {
      const { result } = renderHook(() => useRecordStore())

      act(() => {
        result.current.setCurrentRecord(mockRecords[0])
      })

      expect(result.current.currentRecord).toEqual(mockRecords[0])
    })

    it('应该能清除当前记录', () => {
      const { result } = renderHook(() => useRecordStore())

      act(() => {
        result.current.setCurrentRecord(mockRecords[0])
      })

      act(() => {
        result.current.setCurrentRecord(null)
      })

      expect(result.current.currentRecord).toBeNull()
    })
  })

  describe('loadProjectsFromCache 方法', () => {
    it('应该从缓存加载治疗项目', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockProjects)
      )

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await result.current.loadProjectsFromCache()
      })

      expect(result.current.projects).toEqual(mockProjects)
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PROJECTS_CACHE
      )
    })

    it('当缓存为空时不应该更新状态', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)

      const { result } = renderHook(() => useRecordStore())

      await act(async () => {
        await result.current.loadProjectsFromCache()
      })

      expect(result.current.projects).toEqual([])
    })
  })

  describe('clearRecords 方法', () => {
    it('应该清空记录列表', () => {
      const { result } = renderHook(() => useRecordStore())

      act(() => {
        useRecordStore.setState({
          records: mockRecords,
          currentRecord: mockRecords[0],
        })
      })

      expect(result.current.records).toEqual(mockRecords)

      act(() => {
        result.current.clearRecords()
      })

      expect(result.current.records).toEqual([])
      expect(result.current.currentRecord).toBeNull()
    })
  })

  describe('updateRecentProjects 私有方法', () => {
    it('应该增加现有项目的使用次数', () => {
      const { result } = renderHook(() => useRecordStore())

      act(() => {
        useRecordStore.setState({
          projects: mockProjects,
          recentProjects: [
            { projectId: 1, projectName: '物理治疗', count: 1 },
          ],
        })
      })

      act(() => {
        // 通过创建记录来间接测试
        const { updateRecentProjects } = useRecordStore.getState()
        updateRecentProjects(1)
      })

      const updated = result.current.recentProjects.find(
        (p) => p.projectId === 1
      )
      expect(updated?.count).toBe(2)
    })

    it('应该添加新的项目到最近使用', () => {
      const { result } = renderHook(() => useRecordStore())

      act(() => {
        useRecordStore.setState({
          projects: mockProjects,
          recentProjects: [],
        })
      })

      act(() => {
        const { updateRecentProjects } = useRecordStore.getState()
        updateRecentProjects(2)
      })

      const newProject = result.current.recentProjects.find(
        (p) => p.projectId === 2
      )
      expect(newProject).toBeDefined()
      expect(newProject?.count).toBe(1)
    })
  })
})
