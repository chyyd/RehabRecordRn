// 患者详情屏幕
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Card, Avatar, Button, Divider, useTheme } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useRoute, useNavigation } from '@react-navigation/native'
import { patientApi } from '@/services/api'
import type { Patient } from '@/types'

const PatientDetailScreen = () => {
  const theme = useTheme()
  const route = useRoute()
  const navigation = useNavigation()
  const { patientId } = route.params as { patientId: number }

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatientDetail()
  }, [patientId])

  const loadPatientDetail = async () => {
    try {
      setLoading(true)
      const data = await patientApi.getPatientDetail(patientId)
      setPatient(data)
      navigation.setOptions({ title: `${data.name} 的详情` })
    } catch (error: any) {
      Alert.alert('错误', error.message || '加载患者详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecord = () => {
    // TODO: 导航到创建记录页面
    Alert.alert('提示', '创建记录功能将在后续实现')
  }

  const handleViewHistory = () => {
    // TODO: 导航到历史记录页面
    Alert.alert('提示', '历史记录功能将在后续实现')
  }

  if (loading || !patient) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* 患者基本信息卡片 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Avatar.Text
              size={64}
              label={patient.name?.substring(0, 1) || 'P'}
              style={styles.avatar}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{patient.name}</Text>
              <View style={styles.tagRow}>
                <View style={[styles.tag, { backgroundColor: theme.colors.primaryContainer }]}>
                  <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                    {patient.gender}
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: '#f3f4f6' }]}>
                  <Text style={styles.tagText}>{patient.age}岁</Text>
                </View>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoSection}>
            <InfoItem label="病历号" value={patient.medicalRecordNo} />
            <InfoItem label="医保类型" value={patient.insuranceType} />
            {patient.admissionDate && (
              <InfoItem label="入院日期" value={patient.admissionDate} />
            )}
            {patient.dischargeDate && (
              <InfoItem label="出院日期" value={patient.dischargeDate} />
            )}
            <InfoItem
              label="状态"
              value={patient.status === 'inpatient' ? '住院中' : '门诊'}
            />
          </View>
        </Card.Content>
      </Card>

      {/* 快捷操作 */}
      <Text style={styles.sectionTitle}>快捷操作</Text>
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          onPress={handleCreateRecord}
          style={styles.actionButton}
          icon="plus-circle"
        >
          创建治疗记录
        </Button>
        <Button
          mode="outlined"
          onPress={handleViewHistory}
          style={styles.actionButton}
          icon="history"
        >
          查看历史记录
        </Button>
      </View>

      {/* 最近记录 */}
      <Text style={styles.sectionTitle}>最近治疗记录</Text>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.emptyRecords}>
            <Icon name="history" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>暂无最近记录</Text>
            <Text style={styles.emptySubtext}>点击"创建治疗记录"开始</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  infoSection: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  emptyRecords: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
})

export default PatientDetailScreen
