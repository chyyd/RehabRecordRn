// 历史记录屏幕 - 修复依赖问题
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { Card, Avatar, useTheme, Chip } from 'react-native-paper'
import { useRoute, useNavigation } from '@react-navigation/native'
import { recordApi } from '@/services/api'
import { createLogger } from '@/utils/logger'
import type { TreatmentRecord } from '@/types'
import type { RecordHistoryRouteProp, MainNavigationProp } from '@/navigation'

const logger = createLogger('RecordHistory')

const RecordHistoryScreen = () => {
  const theme = useTheme()
  const route = useRoute()
  const navigation = useNavigation<MainNavigationProp>()
  const { patientId } = route.params as RecordHistoryRouteProp['params']

  const [records, setRecords] = useState<TreatmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ 使用 useCallback 包装加载函数
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      const data = await recordApi.getPatientHistory(patientId, 30) // 最近30天
      setRecords(data)
    } catch (error: any) {
      logger.error('加载历史记录失败', error)
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadHistory()
  }, [loadHistory]) // ✅ 添加依赖

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(
      date.getHours()
    ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  // ✅ 使用 useCallback 优化导航函数
  const navigateToDetail = useCallback(
    (recordId: number) => {
      navigation.navigate('RecordDetail', { recordId })
    },
    [navigation]
  )

  const renderRecordItem = useCallback(
    ({ item }: { item: TreatmentRecord }) => (
      <TouchableOpacity onPress={() => navigateToDetail(item.id)}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.recordHeader}>
              <Text style={styles.projectName}>{item.project?.name}</Text>
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      item.status === 'completed'
                        ? '#d1fae5'
                        : item.status === 'cancelled'
                        ? '#fee2e2'
                        : '#fef3c7',
                  },
                ]}
                textStyle={{
                  color:
                    item.status === 'completed'
                      ? '#065f46'
                      : item.status === 'cancelled'
                      ? '#991b1b'
                      : '#92400e',
                }}
              >
                {item.status === 'completed'
                  ? '已完成'
                  : item.status === 'cancelled'
                  ? '已取消'
                  : '待处理'}
              </Chip>
            </View>

            <View style={styles.recordInfo}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>时间</Text>
                <Text style={styles.infoValue}>{formatTime(item.startTime)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>时长</Text>
                <Text style={styles.infoValue}>{item.durationMinutes}分钟</Text>
              </View>
            </View>

            <View style={styles.therapistRow}>
              <Avatar.Text
                size={24}
                label={item.therapist?.name?.substring(0, 1) || 'T'}
                style={styles.therapistAvatar}
              />
              <Text style={styles.therapistName}>{item.therapist?.name}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    ),
    [navigateToDetail]
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderRecordItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无历史记录</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recordInfo: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  therapistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  therapistAvatar: {
    marginRight: 8,
    backgroundColor: '#e0f2fe',
  },
  therapistName: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
})

export default RecordHistoryScreen
