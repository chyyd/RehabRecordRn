// 治疗记录相关类型定义

export interface TreatmentProject {
  id: number
  name: string
  defaultDuration: number // 默认时长（分钟）
  category?: string
  description?: string
  applicableRoles: string[] // 可操作角色
}

export interface TreatmentRecord {
  id: number
  patientId: number
  patient?: Patient // 关联患者信息
  projectId: number
  project?: TreatmentProject // 关联治疗项目
  therapistId: number
  therapist?: UserInfo // 关联治疗师
  startTime: string // ISO 8601 格式
  endTime: string
  durationMinutes: number
  patientReaction?: string // 患者反应
  signatureImage?: string // 签名图片（Base64）
  notes?: string // 备注
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateRecordDto {
  patientId: number
  projectId: number
  startTime: string
  endTime: string
  durationMinutes: number
  patientReaction?: string
  signatureImage?: string
  notes?: string
}

export interface UpdateRecordDto extends Partial<CreateRecordDto> {
  id: number
}

export interface RecordSearchParams {
  patientId?: number
  therapistId?: number
  projectId?: number
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
