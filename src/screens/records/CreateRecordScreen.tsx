// 创建治疗记录屏幕
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import {
  Card,
  Button,
  TextInput,
  Chip,
  useTheme,
} from 'react-native-paper'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useRecordStore, usePatientStore } from '@/stores'
import { recordApi } from '@/services/api'
import type { Patient, TreatmentProject } from '@/types'
import SignaturePad from '@/components/SignaturePad'

const CreateRecordScreen = () => {
  const theme = useTheme()
  const route = useRoute()
  const navigation = useNavigation()
  const { patientId } = route.params as { patientId: number }

  const { projects, fetchProjects, recentProjects } = useRecordStore()
  const { patients } = usePatientStore()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [selectedProject, setSelectedProject] = useState<TreatmentProject | null>(null)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [patientReaction, setPatientReaction] = useState('')
  const [notes, setNotes] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [signature, setSignature] = useState<string>('')
  const [showSignature, setShowSignature] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // 加载治疗项目
    fetchProjects()

    // 查找患者信息
    const p = patients.find((p) => p.id === patientId)
    if (p) {
      setPatient(p)
    }
  }, [patientId])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRunning) {
      timer = setInterval(() => {
        setEndTime(new Date())
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRunning])

  const handleSelectProject = (project: TreatmentProject) => {
    setSelectedProject(project)
    if (!isRunning) {
      setStartTime(new Date())
      setEndTime(null)
      setIsRunning(true)
    }
  }

  const handleStopTreatment = () => {
    if (isRunning) {
      setEndTime(new Date())
      setIsRunning(false)
    }
  }

  const handleSaveRecord = async () => {
    if (!selectedProject) {
      Alert.alert('提示', '请选择治疗项目')
      return
    }

    if (!endTime) {
      Alert.alert('提示', '请先结束治疗')
      return
    }

    if (!signature) {
      Alert.alert('提示', '请签名确认')
      return
    }

    try {
      setSaving(true)

      const durationMinutes = Math.ceil(
        (endTime.getTime() - startTime.getTime()) / 60000
      )

      await recordApi.createRecord({
        patientId,
        projectId: selectedProject.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMinutes,
        patientReaction,
        signatureImage: signature,
        notes,
      })

      Alert.alert('成功', '治疗记录已保存', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ])
    } catch (error: any) {
      Alert.alert('保存失败', error.message || '请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const formatDuration = () => {
    if (!endTime) return '0分钟'
    const minutes = Math.ceil((endTime.getTime() - startTime.getTime()) / 60000)
    return `${minutes}分钟`
  }

  return (
    <ScrollView style={styles.container}>
      {/* 患者信息卡片 */}
      {patient && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.patientHeader}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientNo}>{patient.medicalRecordNo}</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 最近使用 */}
      {recentProjects.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>⚡ 最近使用</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.chipContainer}
          >
            {recentProjects.map((item) => {
              const project = projects.find((p) => p.id === item.projectId)
              return project ? (
                <Chip
                  key={item.projectId}
                  selected={selectedProject?.id === item.projectId}
                  onPress={() => handleSelectProject(project)}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {project.name} ({item.count}次)
                </Chip>
              ) : null
            })}
          </ScrollView>
        </>
      )}

      {/* 治疗项目选择 */}
      <Text style={styles.sectionTitle}>
        选择治疗项目 {selectedProject && '✓'}
      </Text>
      <View style={styles.projectGrid}>
        {(showAllProjects ? projects : projects.slice(0, 6)).map((project) => (
          <Card
            key={project.id}
            style={[
              styles.projectCard,
              selectedProject?.id === project.id && styles.selectedCard,
            ]}
            onPress={() => handleSelectProject(project)}
          >
            <Card.Content style={styles.projectContent}>
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDuration}>{project.defaultDuration}分钟</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {projects.length > 6 && (
        <Button
          mode="text"
          onPress={() => setShowAllProjects(!showAllProjects)}
          style={styles.expandButton}
        >
          {showAllProjects ? '收起 ▲' : `展开全部 ▼ (${projects.length})`}
        </Button>
      )}

      {/* 计时器 */}
      {isRunning && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.timerLabel}>治疗时长</Text>
            <Text style={styles.timerValue}>{formatDuration()}</Text>
            <Button
              mode="contained"
              onPress={handleStopTreatment}
              style={styles.stopButton}
              buttonColor="#ef4444"
            >
              结束治疗
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* 患者反应 */}
      {endTime && (
        <>
          <Text style={styles.sectionTitle}>患者反应</Text>
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="患者反应（选填）"
                value={patientReaction}
                onChangeText={setPatientReaction}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="描述患者在治疗过程中的反应..."
              />
            </Card.Content>
          </Card>

          {/* 备注 */}
          <Text style={styles.sectionTitle}>备注</Text>
          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="备注（选填）"
                value={notes}
                onChangeText={setNotes}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="其他需要记录的信息..."
              />
            </Card.Content>
          </Card>

          {/* 签名 */}
          <Text style={styles.sectionTitle}>签名确认 *</Text>
          <Card style={styles.card}>
            <Card.Content>
              {signature ? (
                <View style={styles.signaturePreview}>
                  <Text style={styles.signedText}>✓ 已签名</Text>
                  <Button mode="text" onPress={() => setSignature('')}>
                    重新签名
                  </Button>
                </View>
              ) : (
                <Button
                  mode="outlined"
                  onPress={() => setShowSignature(true)}
                  icon="draw"
                >
                  点击签名
                </Button>
              )}
            </Card.Content>
          </Card>

          {/* 保存按钮 */}
          <Button
            mode="contained"
            onPress={handleSaveRecord}
            loading={saving}
            disabled={saving || !signature}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            保存记录
          </Button>
        </>
      )}

      {/* 签名组件 */}
      <SignaturePad
        visible={showSignature}
        onConfirm={(data) => {
          setSignature(data)
          setShowSignature(false)
        }}
        onClose={() => setShowSignature(false)}
      />

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  card: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
  },
  patientHeader: {
    alignItems: 'center',
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  patientNo: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },
  chipContainer: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
  },
  chipText: {
    fontSize: 13,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  projectCard: {
    width: '48%',
    margin: '1%',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#0ea5e9',
  },
  projectContent: {
    alignItems: 'center',
    padding: 8,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  projectDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  expandButton: {
    marginLeft: 16,
  },
  timerLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0ea5e9',
    textAlign: 'center',
    marginBottom: 16,
  },
  stopButton: {
    marginTop: 8,
  },
  signaturePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  signedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#16a34a',
  },
  saveButton: {
    margin: 16,
    marginTop: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
})

export default CreateRecordScreen
