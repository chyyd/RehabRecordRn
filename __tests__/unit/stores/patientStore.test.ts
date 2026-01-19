/**
 * PatientStore 单元测试
 */

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { AsyncStorage } from '@react-native-async-storage/async-storage'
import { usePatientStore } from '@/stores/patientStore'
import { patientApi } from '@/services/api'
import { STORAGE_KEYS } from '@/utils/constants'
import type { Patient } from '@/types'

// Mock API
jest.mock('@/services/api', () => ({
  patientApi: {
    getPatients: jest.fn(),
    searchPatients: jest.fn(),
    getPatientDetail: jest.fn(),
    createPatient: jest.fn(),
    updatePatient: jest.fn(),
    deletePatient: jest.fn(),
  },
}))

const mockPatientApi = patientApi as jest.Mocked<typeof patientApi>

const mockPatients: Patient[] = [
  {
    id: 1,
    name: '张三',
    gender: 'male',
    age: 45,
    diagnosis: '腰椎间盘突出',
    createdAt: '2025-01-19T10:00:00Z',
    updatedAt: '2025-01-19T10:00:00Z',
  },
  {
    id: 2,
    name: '李四',
    gender: 'female',
    age: 38,
    diagnosis: '颈椎病',
    createdAt: '2025-01-19T11:00:00Z',
    updatedAt: '2025-01-19T11:00:00Z',
  },
]

describe('PatientStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 重置所有AsyncStorage方法的mock
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

    // 重置store状态（基于Context7最佳实践）
    usePatientStore.setState({
      patients: [],
      currentPatient: null,
      searchQuery: '',
      isLoading: false,
      isRefreshing: false,
      lastFetchTime: null,
    })
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const { result } = renderHook(() => usePatientStore())

      expect(result.current.patients).toEqual([])
      expect(result.current.currentPatient).toBeNull()
      expect(result.current.searchQuery).toBe('')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isRefreshing).toBe(false)
      expect(result.current.lastFetchTime).toBeNull()
    })
  })

  describe('fetchPatients 方法', () => {
    it('应该成功获取患者列表', async () => {
      mockPatientApi.getPatients.mockResolvedValue({
        data: mockPatients,
        status: 200,
      } as any)

      const { result } = renderHook(() => usePatientStore())

      await act(async () => {
        await result.current.fetchPatients()
      })

      expect(result.current.patients).toEqual(mockPatients)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.lastFetchTime).toBeTruthy()

      expect(mockPatientApi.getPatients).toHaveBeenCalledTimes(1)
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PATIENTS_CACHE,
        JSON.stringify(mockPatients)
      )
    })

    it('应该处理获取患者列表失败', async () => {
      const mockError = new Error('获取失败')
      mockPatientApi.getPatients.mockRejectedValue(mockError)

      const { result } = renderHook(() => usePatientStore())

      await act(async () => {
        await expect(result.current.fetchPatients()).rejects.toThrow('获取失败')
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('应该在获取期间设置加载状态', async () => {
      mockPatientApi.getPatients.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: { data: mockPatients }, statusCode: 200 })
            }, 100)
          })
      )

      const { result } = renderHook(() => usePatientStore())

      act(() => {
        result.current.fetchPatients()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('searchPatients 方法', () => {
    it('应该搜索患者', async () => {
      const searchResults = [mockPatients[0]]
      mockPatientApi.getPatients.mockResolvedValue({
        data: { data: mockPatients },
        statusCode: 200,
      })
      mockPatientApi.searchPatients.mockResolvedValue(searchResults)

      const { result } = renderHook(() => usePatientStore())

      await act(async () => {
        await result.current.searchPatients('张三')
      })

      expect(result.current.patients).toEqual(searchResults)
      expect(result.current.searchQuery).toBe('张三')
      expect(mockPatientApi.searchPatients).toHaveBeenCalledWith('张三')
    })

    it('当搜索关键词为空时应该获取所有患者', async () => {
      mockPatientApi.getPatients.mockResolvedValue({
        data: { data: mockPatients },
        statusCode: 200,
      })

      const { result } = renderHook(() => usePatientStore())

      await act(async () => {
        await result.current.searchPatients('')
      })

      expect(result.current.patients).toEqual(mockPatients)
      expect(mockPatientApi.getPatients).toHaveBeenCalled()
    })
  })

  describe('loadPatientsFromCache 方法', () => {
    it('应该从缓存加载患者列表', async () => {
      const cachedPatients = mockPatients
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedPatients)
      )

      const { result } = renderHook(() => usePatientStore())

      await act(async () => {
        await result.current.loadPatientsFromCache()
      })

      expect(result.current.patients).toEqual(cachedPatients)
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PATIENTS_CACHE
      )
    })

    it('当缓存为空时不应该更新状态', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)

      const { result } = renderHook(() => usePatientStore())

      await act(async () => {
        await result.current.loadPatientsFromCache()
      })

      expect(result.current.patients).toEqual([])
    })
  })

  describe('setCurrentPatient 方法', () => {
    it('应该设置当前患者', () => {
      const { result } = renderHook(() => usePatientStore())

      act(() => {
        result.current.setCurrentPatient(mockPatients[0])
      })

      expect(result.current.currentPatient).toEqual(mockPatients[0])
    })

    it('应该能清除当前患者', () => {
      const { result } = renderHook(() => usePatientStore())

      act(() => {
        result.current.setCurrentPatient(mockPatients[0])
      })

      expect(result.current.currentPatient).toEqual(mockPatients[0])

      act(() => {
        result.current.setCurrentPatient(null)
      })

      expect(result.current.currentPatient).toBeNull()
    })
  })

  describe('refreshPatients 方法', () => {
    it('应该刷新患者列表', async () => {
      mockPatientApi.getPatients.mockResolvedValue({
        data: { data: mockPatients },
        statusCode: 200,
      })

      const { result } = renderHook(() => usePatientStore())

      await act(async () => {
        await result.current.refreshPatients()
      })

      expect(result.current.patients).toEqual(mockPatients)
      expect(result.current.isRefreshing).toBe(false)
      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('clearPatients 方法', () => {
    it('应该清空患者列表', () => {
      const { result } = renderHook(() => usePatientStore())

      // 先设置一些数据
      act(() => {
        usePatientStore.setState({
          patients: mockPatients,
          currentPatient: mockPatients[0],
          searchQuery: 'test',
          lastFetchTime: Date.now(),
        })
      })

      expect(result.current.patients).toEqual(mockPatients)

      act(() => {
        result.current.clearPatients()
      })

      expect(result.current.patients).toEqual([])
      expect(result.current.currentPatient).toBeNull()
      expect(result.current.searchQuery).toBe('')
      expect(result.current.lastFetchTime).toBeNull()
    })
  })
})
