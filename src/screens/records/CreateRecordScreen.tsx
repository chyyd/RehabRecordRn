/**
 * 创建治疗记录屏幕
 * 逻辑与 mobile-frontend 一致
 */

import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import {
  Card,
  Button,
  useTheme,
} from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useRecordStore, usePatientStore } from '@/stores'
import { recordApi } from '@/services/api'
import { API_ENDPOINTS } from '@/utils/constants'
import { request } from '@/services/api/client'
import type { Patient, TreatmentProject } from '@/types'
import SignaturePad from '@/components/SignaturePad'

interface RecentProject {
  projectId: number
  projectName: string
  count: number
}

const CreateRecordScreen = () => {
  const theme = useTheme()
  const route = useRoute()
  const navigation = useNavigation()
  const { patientId } = route.params as { patientId: number }

  const { projects, fetchProjects } = useRecordStore()
  const { patients } = usePatientStore()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [selectedProject, setSelectedProject] = useState<TreatmentProject | null>(null)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [signature, setSignature] = useState<string>('')
  const [showSignature, setShowSignature] = useState(false)
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [loadingRecent, setLoadingRecent] = useState(true)

  useEffect(() => {
    // 加载治疗项目
    fetchProjects()

    // 查找患者信息
    const p = patients.find((p) => p.id === patientId)
    if (p) {
      setPatient(p)
    }

    // 加载最近使用的项目
    loadRecentProjects()
  }, [patientId])

  /**
   * 加载患者最近使用的治疗项目
   * 从最近7天的治疗记录中统计
   */
  const loadRecentProjects = useCallback(async () => {
    try {
      setLoadingRecent(true)

      // 计算最近7天的日期范围（使用本地时区）
      const today = new Date()
      const sevenDaysAgo = new Date(today)
      sevenDaysAgo.setDate(today.getDate() - 7)

      // 格式化日期为 YYYY-MM-DD（使用本地时区）
      const formatDate = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      const startDate = formatDate(sevenDaysAgo)
      const endDate = formatDate(today)

      console.log('查询日期范围:', startDate, '至', endDate)

      // 获取该患者最近7天的治疗记录
      const response = await request<any>({
        method: 'GET',
        url: API_ENDPOINTS.RECORDS,
        params: {
          patientId,
          startDate,
          endDate,
        },
      })

      console.log('📊 API响应:', response.data)

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // 统计每个项目的使用次数
        const projectStats = new Map<number, { count: number; name: string }>()

        response.data.forEach((record: any) => {
          const projectId = record.project?.id
          if (projectId) {
            const existing = projectStats.get(projectId)
            if (existing) {
              existing.count++
            } else {
              projectStats.set(projectId, {
                count: 1,
                name: record.project?.name || '未知项目',
              })
            }
          }
        })

        // 转换为数组并按使用次数排序
        let sortedProjects = Array.from(projectStats.entries())
          .map(([projectId, data]) => ({
            projectId,
            projectName: data.name,
            count: data.count,
          }))
          .sort((a, b) => b.count - a.count)

        // 筛选出当前用户可操作的项目
        if (projects && projects.length > 0) {
          const userProjectIds = new Set(projects.map((p) => p.id))
          sortedProjects = sortedProjects.filter((p) => userProjectIds.has(p.projectId))
        }

        // 只取前6个
        sortedProjects = sortedProjects.slice(0, 6)

        setRecentProjects(sortedProjects)
        console.log('✅ 最近使用项目:', sortedProjects)
      } else {
        setRecentProjects([])
        console.log('⚠️ 该患者最近7天无治疗记录')
      }
    } catch (error) {
      console.error('❌ 加载最近项目失败:', error)
      setRecentProjects([])
    } finally {
      setLoadingRecent(false)
    }
  }, [patientId, projects])

  /**
   * 快捷选择项目并开始治疗
   */
  const handleQuickSelectProject = useCallback(async (recentProject: RecentProject) => {
    console.log('📌 快捷选择项目:', recentProject)
    console.log('📋 当前项目列表:', projects)

    // 从完整项目列表中查找项目
    let project = projects.find((p) => p.id === recentProject.projectId)

    // 如果找不到，可能 projects 还没加载完成，等待加载
    if (!project && projects.length === 0) {
      console.log('⏳ 项目列表为空，等待加载...')
      await fetchProjects()
      project = projects.find((p) => p.id === recentProject.projectId)
    }

    if (project) {
      console.log('✅ 找到项目:', project)
      setSelectedProject(project)
      // 直接传递项目，而不是依赖状态
      await startTreatmentWithProject(project)
    } else {
      console.error('❌ 未找到项目，ID:', recentProject.projectId)
      Alert.alert('错误', '未找到该治疗项目，请重试')
    }
  }, [projects, fetchProjects])

  /**
   * 选择项目并开始治疗
   */
  const handleSelectProject = useCallback(async (project: TreatmentProject) => {
    console.log('📌 选择项目:', project)
    setSelectedProject(project)
    // 直接传递项目，而不是依赖状态
    await startTreatmentWithProject(project)
  }, [])

  /**
   * 开始治疗流程（验证时间冲突）- 接收项目作为参数
   */
  const startTreatmentWithProject = async (project: TreatmentProject) => {
    console.log('🚀 开始治疗流程，项目:', project)

    if (!project) {
      Alert.alert('提示', '请先选择治疗项目')
      return
    }

    setValidating(true)

    try {
      // 验证时间冲突
      const startTime = new Date()

      const response = await request<any>({
        method: 'POST',
        url: '/records/validate-time-conflict',
        data: {
          patientId,
          startTime: startTime.toISOString(),
        },
      })

      console.log('⏰ 时间冲突验证:', response.data)

      setValidating(false)

      // 检查是否有冲突
      if (response.data?.hasConflict) {
        Alert.alert(
          '时间冲突警告',
          response.data.message || '该患者当前时间段已有治疗记录，请选择其他时间',
          [{ text: '我知道了' }]
        )
        return
      }

      // 无冲突，显示签名弹窗
      setShowSignature(true)
    } catch (error: any) {
      console.error('❌ 验证时间冲突失败:', error)
      setValidating(false)

      // 验证失败也允许继续
      Alert.alert(
        '验证失败',
        '无法验证时间冲突，是否继续治疗记录？',
        [
          { text: '取消', style: 'cancel' },
          { text: '继续', onPress: () => setShowSignature(true) },
        ]
      )
    }
  }

  /**
   * 签名确认
   */
  const handleSignatureConfirm = async (imageData: string) => {
    setSignature(imageData)
    setShowSignature(false)

    setSaving(true)

    try {
      // 上传签名图片
      const signatureFilename = await uploadSignature(imageData)

      // 创建治疗记录
      const startTime = new Date()

      if (!selectedProject) {
        throw new Error('未选择治疗项目')
      }

      await recordApi.createRecord({
        patientId,
        projectId: selectedProject.id,
        startTime: startTime.toISOString(),
        endTime: startTime.toISOString(),
        durationMinutes: selectedProject.defaultDuration,
        patientReaction: '无不良反应',
        signatureImage: signatureFilename,
        notes: '',
      })

      Alert.alert(
        '成功',
        '治疗记录已保存',
        [
          {
            text: '确定',
            onPress: () => {
              // 保存成功后跳转到扫码页面
              navigation.reset({
                index: 0,
                routes: [{ name: 'Tabs' as never }],
              })
            },
          },
        ]
      )
    } catch (error: any) {
      console.error('❌ 保存记录失败:', error)
      Alert.alert('保存失败', error.message || '请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  /**
   * 上传签名图片到服务器
   * React Native 环境下直接使用 base64 数据
   */
  const uploadSignature = async (base64Data: string): Promise<string> => {
    // 提取base64数据（移除 data:image/png;base64, 前缀）
    const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data

    // 创建 FormData
    const formData = new FormData()

    // 在 React Native 中，直接使用 base64 创建文件对象
    // 注意：react-native-signature-canvas 返回的是 data URL 格式
    formData.append('photo', {
      uri: base64Data, // 使用完整的 data URL
      type: 'image/png',
      name: 'signature.png',
    } as any)

    formData.append('isSignature', 'true')
    formData.append('medicalRecordNo', patient?.medicalRecordNo || '')
    formData.append('treatmentTime', new Date().toISOString())
    formData.append('projectName', selectedProject?.name || '')

    const response = await request<any>({
      method: 'POST',
      url: '/photos/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (!response.data?.filename) {
      throw new Error('签名上传失败')
    }

    return response.data.filename
  }

  if (!patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* 患者信息卡片 */}
      <Card style={styles.patientCard}>
        <Card.Content>
          <View style={styles.patientHeader}>
            <View style={styles.patientAvatar}>
              <Text style={styles.avatarText}>{patient.name?.substring(0, 1)}</Text>
            </View>
            <View style={styles.patientDetail}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientNo}>{patient.medicalRecordNo}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 最近使用 */}
      {recentProjects.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>⚡ 最近使用</Text>

            <View style={styles.recentProjectsGrid}>
              {recentProjects.map((project) => (
                <TouchableOpacity
                  key={project.projectId}
                  style={[
                    styles.recentProjectCard,
                    selectedProject?.id === project.projectId && styles.activeRecentCard,
                  ]}
                  onPress={() => handleQuickSelectProject(project)}
                >
                  <View style={styles.recentProjectIcon}>
                    <Text style={styles.iconFire}>⚡</Text>
                  </View>
                  <View style={styles.recentProjectInfo}>
                    <Text style={styles.recentProjectName}>{project.projectName}</Text>
                    <Text style={styles.recentProjectCount}>已使用 {project.count} 次</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setShowAllProjects(!showAllProjects)}
            >
              <Text style={styles.expandText}>
                {showAllProjects ? '▼ 收起全部项目' : '📋 展开全部项目'}
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}

      {/* 治疗项目选择 */}
      {showAllProjects || recentProjects.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>选择治疗项目 *</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.projectScroll}
              contentContainerStyle={styles.projectScrollContent}
            >
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectItem,
                    selectedProject?.id === project.id && styles.activeProject,
                  ]}
                  onPress={() => handleSelectProject(project)}
                >
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectDuration}>{project.defaultDuration}分钟</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      ) : null}

      {/* 签名组件 */}
      <SignaturePad
        visible={showSignature}
        onConfirm={handleSignatureConfirm}
        onClose={() => setShowSignature(false)}
      />

      {/* 验证中提示 */}
      {validating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>验证中...</Text>
        </View>
      )}

      {/* 保存中提示 */}
      {saving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>保存中...</Text>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientCard: {
    margin: 16,
    marginBottom: 12,
    backgroundColor: '#0ea5e9',
    elevation: 4,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  patientDetail: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  patientNo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  card: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  recentProjectsGrid: {
    gap: 12,
  },
  recentProjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(14, 165, 233, 0.15)',
  },
  activeRecentCard: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  recentProjectIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconFire: {
    fontSize: 24,
  },
  recentProjectInfo: {
    flex: 1,
  },
  recentProjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 4,
  },
  recentProjectCount: {
    fontSize: 13,
    color: '#0284c7',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    padding: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  expandButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0ea5e9',
    borderStyle: 'dashed',
  },
  expandText: {
    fontSize: 15,
    color: '#0ea5e9',
    fontWeight: '600',
  },
  projectScroll: {
    marginHorizontal: -16,
  },
  projectScrollContent: {
    paddingHorizontal: 16,
  },
  projectItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeProject: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  projectName: {
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  projectDuration: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
})

export default CreateRecordScreen
