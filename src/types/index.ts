// 统一导出所有类型定义

export * from './auth.types'
export * from './patient.types'
export * from './record.types'
export * from './sync.types'
export * from './common.types'

// 重新导出常用类型
export type {
  LoginDto,
  UserInfo,
  LoginResponse,
} from './auth.types'

export type {
  Patient,
  CreatePatientDto,
  UpdatePatientDto,
} from './patient.types'

export type {
  TreatmentRecord,
  TreatmentProject,
  CreateRecordDto,
} from './record.types'
