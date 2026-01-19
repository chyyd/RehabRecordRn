// 患者列表屏幕 - 性能优化版本
import React, { useEffect, useState, useCallback, memo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { TextInput, useTheme } from 'react-native-paper'
import type { MainNavigationProp } from '@/navigation'
import { usePatientStore } from '@/stores/patientStore'
import { useDebounce } from '@/hooks'
import type { Patient } from '@/types'

// ============================================================
// 类型定义
// ============================================================

interface PatientCardProps {
  patient: Patient
  onPress: () => void
}

// ============================================================
// Memoized 患者卡片组件
// ============================================================

const PatientCard = memo<PatientCardProps>(
  ({ patient, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.patientHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {patient.name?.substring(0, 1) || 'P'}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <View style={[styles.tag, { backgroundColor: '#e0f2fe' }]}>
                  <Text style={[styles.tagText, { color: '#0ea5e9' }]}>
                    {patient.gender}
                  </Text>
                </View>
              </View>
              <Text style={styles.medicalRecord}>{patient.medicalRecordNo}</Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>年龄:</Text>
              <Text style={styles.detailValue}>{patient.age}岁</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>医保:</Text>
              <Text style={styles.detailValue}>{patient.insuranceType}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ),
  (prevProps, nextProps) => {
    // 只有当患者 ID 改变时才重新渲染
    return prevProps.patient.id === nextProps.patient.id
  }
)

PatientCard.displayName = 'PatientCard'

// ============================================================
// 主屏幕组件
// ============================================================

const PatientListScreen = () => {
  const theme = useTheme()
  const navigation = useNavigation<MainNavigationProp>()

  const {
    patients,
    isLoading,
    isRefreshing,
    fetchPatients,
    refreshPatients,
    searchPatients,
  } = usePatientStore()

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // 初始加载
  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  // 防抖搜索
  useEffect(() => {
    if (debouncedSearchQuery) {
      searchPatients(debouncedSearchQuery)
    } else if (searchQuery === '') {
      // 清空搜索时重新加载所有患者
      fetchPatients()
    }
  }, [debouncedSearchQuery, searchQuery, fetchPatients, searchPatients])

  // 使用 useCallback 优化渲染函数
  const renderItem = useCallback(
    ({ item }: { item: Patient }) => (
      <PatientCard
        patient={item}
        onPress={() =>
          navigation.navigate('PatientDetail', { patientId: item.id })
        }
      />
    ),
    [navigation]
  )

  // 使用 useCallback 优化刷新函数
  const onRefresh = useCallback(() => {
    refreshPatients()
  }, [refreshPatients])

  // 使用 useCallback 优化搜索清除函数
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    fetchPatients()
  }, [fetchPatients])

  // 列表空组件
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无患者数据</Text>
        <Text style={styles.emptySubtext}>下拉刷新或搜索患者</Text>
      </View>
    ),
    []
  )

  // 列表头部组件（搜索栏）
  const ListHeaderComponent = useCallback(
    () => (
      <View style={styles.searchContainer}>
        <TextInput
          mode="outlined"
          placeholder="搜索患者（姓名/拼音/病历号）"
          value={searchQuery}
          onChangeText={setSearchQuery}
          left={<TextInput.Icon icon="magnify" />}
          right={
            searchQuery ? (
              <TextInput.Icon icon="close" onPress={clearSearch} />
            ) : undefined
          }
          style={styles.searchInput}
        />
      </View>
    ),
    [searchQuery, clearSearch]
  )

  // 提取 key 的函数
  const keyExtractor = useCallback((item: Patient) => item.id.toString(), [])

  return (
    <View style={styles.container}>
      <FlatList
        data={patients}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#0ea5e9']}
          />
        }
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={5}
      />
    </View>
  )
}

// ============================================================
// 样式定义
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  patientInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  medicalRecord: {
    fontSize: 14,
    color: '#6b7280',
  },
  details: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
})

export default PatientListScreen
