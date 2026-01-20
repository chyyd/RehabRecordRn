// 历史记录屏幕 - 修复依赖问题
import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native'
import { Card, Avatar } from 'react-native-paper'
import { useRoute, useNavigation } from '@react-navigation/native'
import { recordApi } from '@/services/api'
import { createLogger } from '@/utils/logger'
import type { TreatmentRecord } from '@/types'
import type { RecordHistoryRouteProp, MainNavigationProp } from '@/navigation'

const logger = createLogger('RecordHistory')

const RecordHistoryScreen = () => {
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
    // 后端返回的是UTC时间（ISO 8601格式）
    // 需要转换为北京时间（UTC+8）
    const date = new Date(dateString)

    // 手动添加8小时得到北京时间
    const utcTime = date.getTime()
    const beijingTime = new Date(utcTime + 8 * 60 * 60 * 1000)

    const month = beijingTime.getMonth() + 1
    const day = beijingTime.getDate()
    const hours = String(beijingTime.getHours()).padStart(2, '0')
    const minutes = String(beijingTime.getMinutes()).padStart(2, '0')

    return `${month}月${day}日 ${hours}:${minutes}`
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
              <Text style={styles.recordTime}>{formatTime(item.startTime)}</Text>
            </View>

            <View style={styles.recordInfo}>
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
        // ✅ 性能优化：getItemLayout（基于Context7最佳实践）
        getItemLayout={(data, index) => ({
          length: 120, // 记录卡片固定高度
          offset: 120 * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无历史记录</Text>
            </View>
          ) : null
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={10}
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
  recordTime: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  recordInfo: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
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
