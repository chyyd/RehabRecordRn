// 患者相关类型定义

export interface Patient {
  id: number
  name: string
  gender: '男' | '女'
  age: number
  medicalRecordNo: string // 病历号
  insuranceType: string // 医保类型
  admissionDate?: string // 入院日期
  dischargeDate?: string // 出院日期
  status: 'inpatient' | 'outpatient' // 住院/门诊
  createdAt: string
  updatedAt: string
}

export interface CreatePatientDto {
  name: string
  gender: '男' | '女'
  age: number
  medicalRecordNo: string
  insuranceType: string
  admissionDate?: string
}

export interface UpdatePatientDto extends Partial<CreatePatientDto> {
  id: number
}

export interface PatientSearchParams {
  keyword?: string // 姓名/拼音/病历号
  page?: number
  limit?: number
}
