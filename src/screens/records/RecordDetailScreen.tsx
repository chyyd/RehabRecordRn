// 治疗记录详情屏幕
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native'
import { Card, Avatar, Button, Divider, useTheme } from 'react-native-paper'
import { useRoute, useNavigation } from '@react-navigation/native'
import { recordApi } from '@/services/api'
import type { TreatmentRecord } from '@/types'

const RecordDetailScreen = () => {
  const theme = useTheme()
  const route = useRoute()
  const navigation = useNavigation()
  const { recordId } = route.params as { recordId: number }

  const [record, setRecord] = useState<TreatmentRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecordDetail()
  }, [recordId])

  const loadRecordDetail = async () => {
    try {
      setLoading(true)
      const data = await recordApi.getRecordDetail(recordId)
      setRecord(data)
    } catch (error: any) {
      Alert.alert('错误', error.message || '加载记录详情失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !record) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* 患者信息 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>患者信息</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>姓名</Text>
            <Text style={styles.infoValue}>{record.patient?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>病历号</Text>
            <Text style={styles.infoValue}>{record.patient?.medicalRecordNo}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* 治疗信息 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>治疗信息</Text>
          <Divider style={styles.divider} />

          <InfoRow label="治疗项目" value={record.project?.name || '未知'} />
          <InfoRow label="治疗师" value={record.therapist?.name || '未知'} />
          <InfoRow
            label="开始时间"
            value={new Date(record.startTime).toLocaleString('zh-CN')}
          />
          <InfoRow
            label="结束时间"
            value={new Date(record.endTime).toLocaleString('zh-CN')}
          />
          <InfoRow
            label="治疗时长"
            value={`${record.durationMinutes}分钟`}
          />
        </Card.Content>
      </Card>

      {/* 患者反应 */}
      {record.patientReaction && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>患者反应</Text>
            <Text style={styles.reactionText}>{record.patientReaction}</Text>
          </Card.Content>
        </Card>
      )}

      {/* 备注 */}
      {record.notes && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>备注</Text>
            <Text style={styles.notesText}>{record.notes}</Text>
          </Card.Content>
        </Card>
      )}

      {/* 签名 */}
      {record.signatureImage && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>签名确认</Text>
            <View style={styles.signatureContainer}>
              <Text style={styles.signatureText}>✓ 已签名</Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* 状态 */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>状态</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    record.status === 'completed'
                      ? '#d1fae5'
                      : record.status === 'cancelled'
                      ? '#fee2e2'
                      : '#fef3c7',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      record.status === 'completed'
                        ? '#065f46'
                        : record.status === 'cancelled'
                        ? '#991b1b'
                        : '#92400e',
                  },
                ]}
              >
                {record.status === 'completed'
                  ? '已完成'
                  : record.status === 'cancelled'
                  ? '已取消'
                  : '待处理'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
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
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  reactionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  signatureContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  signatureText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#16a34a',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
})

export default RecordDetailScreen
