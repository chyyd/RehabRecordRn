// 导航类型定义 - 提供完整的类型安全
import type { StackNavigationProp } from '@react-navigation/stack'
import type { RouteProp } from '@react-navigation/native'
import type { StackScreenProps } from '@react-navigation/stack'

// ============================================================
// 认证流程导航参数
// ============================================================

export type AuthStackParamList = {
  Splash: undefined
  Login: undefined
}

// ============================================================
// 主应用导航参数
// ============================================================

export type MainStackParamList = {
  Tabs: undefined
  PatientDetail: { patientId: number }
  CreateRecord: { patientId: number }
  RecordDetail: { recordId: number }
  RecordHistory: { patientId: number }
  QRScanner: { sourceScreen?: 'Scan' | 'PatientDetail' }
}

// ============================================================
// Tab 导航参数
// ============================================================

export type TabParamList = {
  Patients: undefined
  Scan: undefined
  Home: undefined
}

// ============================================================
// 根导航参数（合并所有）
// ============================================================

export type RootStackParamList = {
  Auth: AuthStackParamList
  Main: MainStackParamList
}

// ============================================================
// 导航 Prop 类型
// ============================================================

// 认证屏幕导航类型
export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>

// 主应用导航类型
export type MainNavigationProp = StackNavigationProp<MainStackParamList>

// Tab 导航类型
export type TabNavigationProp = StackNavigationProp<TabParamList>

// ============================================================
// 屏幕 Props 类型（便捷类型）
// ============================================================

// 登录屏幕
export type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>

// 患者详情屏幕
export type PatientDetailScreenProps = StackScreenProps<MainStackParamList, 'PatientDetail'>

// 创建记录屏幕
export type CreateRecordScreenProps = StackScreenProps<MainStackParamList, 'CreateRecord'>

// 记录详情屏幕
export type RecordDetailScreenProps = StackScreenProps<MainStackParamList, 'RecordDetail'>

// 历史记录屏幕
export type RecordHistoryScreenProps = StackScreenProps<MainStackParamList, 'RecordHistory'>

// ============================================================
// Route Prop 类型
// ============================================================

export type PatientDetailRouteProp = RouteProp<MainStackParamList, 'PatientDetail'>
export type CreateRecordRouteProp = RouteProp<MainStackParamList, 'CreateRecord'>
export type RecordDetailRouteProp = RouteProp<MainStackParamList, 'RecordDetail'>
export type RecordHistoryRouteProp = RouteProp<MainStackParamList, 'RecordHistory'>
