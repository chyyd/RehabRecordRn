/**
 * Patient API 单元测试
 */

import MockAdapter from 'axios-mock-adapter'
import { patientApi } from '@/services/api'
import { apiClient } from '@/services/api/client'
import type { Patient } from '@/types'

describe('Patient API', () => {
  let mockAxios: MockAdapter

  beforeEach(() => {
    mockAxios = new MockAdapter(apiClient.client)
    jest.clearAllMocks()
  })

  afterEach(() => {
    mockAxios.restore()
  })

  describe('getPatients 方法', () => {
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
    ]

    it('应该成功获取患者列表', async () => {
      mockAxios.onGet('/patients').reply(200, {
        data: { data: mockPatients },
      })

      const response = await patientApi.getPatients()

      expect(response.data.data).toEqual(mockPatients)
    })

    it('应该支持查询参数', async () => {
      const params = { page: 1, limit: 20 }
      mockAxios.onGet('/patients').reply(200, {
        data: { data: mockPatients },
      })

      await patientApi.getPatients(params)

      expect(mockAxios.history.get[0].params).toEqual(params)
    })

    it('应该处理获取失败', async () => {
      mockAxios.onGet('/patients').reply(500, {
        message: '服务器错误',
      })

      await expect(patientApi.getPatients()).rejects.toMatchObject({
        statusCode: 500,
      })
    })
  })

  describe('searchPatients 方法', () => {
    it('应该成功搜索患者', async () => {
      const searchResults = [
        {
          id: 1,
          name: '张三',
          gender: 'male',
          age: 45,
          diagnosis: '腰椎间盘突出',
          createdAt: '2025-01-19T10:00:00Z',
          updatedAt: '2025-01-19T10:00:00Z',
        },
      ]

      mockAxios.onGet('/patients/search').reply(200, searchResults)

      const results = await patientApi.searchPatients('张三')

      expect(results).toEqual(searchResults)
      expect(mockAxios.history.get[0].params).toEqual({
        keyword: '张三',
      })
    })

    it('应该处理空搜索结果', async () => {
      mockAxios.onGet('/patients/search').reply(200, [])

      const results = await patientApi.searchPatients('不存在的患者')

      expect(results).toEqual([])
    })
  })

  describe('getPatientDetail 方法', () => {
    it('应该成功获取患者详情', async () => {
      const mockPatient = {
        id: 1,
        name: '张三',
        gender: 'male',
        age: 45,
        diagnosis: '腰椎间盘突出',
        createdAt: '2025-01-19T10:00:00Z',
        updatedAt: '2025-01-19T10:00:00Z',
      }

      mockAxios.onGet('/patients/1').reply(200, mockPatient)

      const patient = await patientApi.getPatientDetail(1)

      expect(patient).toEqual(mockPatient)
    })

    it('应该处理患者不存在', async () => {
      mockAxios.onGet('/patients/999').reply(404, {
        message: '患者不存在',
      })

      await expect(patientApi.getPatientDetail(999)).rejects.toMatchObject({
        statusCode: 404,
      })
    })
  })

  describe('createPatient 方法', () => {
    const newPatient = {
      name: '李四',
      gender: 'female' as const,
      age: 38,
      diagnosis: '颈椎病',
    }

    it('应该成功创建患者', async () => {
      const createdPatient = {
        id: 2,
        ...newPatient,
        createdAt: '2025-01-19T11:00:00Z',
        updatedAt: '2025-01-19T11:00:00Z',
      }

      mockAxios.onPost('/patients').reply(201, createdPatient)

      const result = await patientApi.createPatient(newPatient)

      expect(result).toEqual(createdPatient)
    })

    it('应该处理创建失败（验证错误）', async () => {
      mockAxios.onPost('/patients').reply(400, {
        message: '验证失败',
        errors: {
          name: ['姓名不能为空'],
        },
      })

      await expect(
        patientApi.createPatient({
          name: '',
          gender: 'male',
          age: 0,
          diagnosis: '',
        })
      ).rejects.toMatchObject({
        statusCode: 400,
      })
    })
  })

  describe('updatePatient 方法', () => {
    const updateData = {
      name: '更新名称',
      diagnosis: '更新诊断',
    }

    it('应该成功更新患者', async () => {
      const updatedPatient = {
        id: 1,
        name: '张三',
        gender: 'male',
        age: 45,
        diagnosis: '腰椎间盘突出',
        ...updateData,
        createdAt: '2025-01-19T10:00:00Z',
        updatedAt: '2025-01-19T12:00:00Z',
      }

      mockAxios.onPut('/patients/1').reply(200, updatedPatient)

      const result = await patientApi.updatePatient(1, updateData)

      expect(result).toEqual(updatedPatient)
      expect(mockAxios.history.get[0].data).toEqual(updateData)
    })

    it('应该处理更新不存在的患者', async () => {
      mockAxios.onPut('/patients/999').reply(404, {
        message: '患者不存在',
      })

      await expect(
        patientApi.updatePatient(999, updateData)
      ).rejects.toMatchObject({
        statusCode: 404,
      })
    })
  })

  describe('deletePatient 方法', () => {
    it('应该成功删除患者', async () => {
      mockAxios.onDelete('/patients/1').reply(204)

      await patientApi.deletePatient(1)

      expect(mockAxios.history.get[0].url).toBe('/patients/1')
    })

    it('应该处理删除失败', async () => {
      mockAxios.onDelete('/patients/1').reply(404, {
        message: '患者不存在',
      })

      await expect(patientApi.deletePatient(1)).rejects.toMatchObject({
        statusCode: 404,
      })
    })
  })
})
