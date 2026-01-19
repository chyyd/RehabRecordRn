// 同步状态显示组件
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Icon, useTheme } from 'react-native-paper'
import { useSyncStore } from '@/stores/syncStore'

const SyncStatusBar = () => {
  const theme = useTheme()
  const { isOnline, pendingChangesCount, isSyncing, lastSyncTime } = useSyncStore()

  const formatLastSync = () => {
    if (!lastSyncTime) return '未同步'

    const now = Date.now()
    const diff = now - lastSyncTime

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return `${Math.floor(diff / 86400000)}天前`
  }

  return (
    <View style={styles.container}>
      {/* 网络状态 */}
      <View style={styles.statusRow}>
        <Icon
          name={isOnline ? 'wifi' : 'wifi-off'}
          size={16}
          color={isOnline ? '#10b981' : '#ef4444'}
        />
        <Text style={[styles.statusText, { color: isOnline ? '#10b981' : '#ef4444' }]}>
          {isOnline ? '在线' : '离线'}
        </Text>
      </View>

      {/* 同步状态 */}
      {pendingChangesCount > 0 && (
        <View style={styles.statusRow}>
          <Icon name="sync" size={16} color="#f59e0b" />
          <Text style={styles.statusText}>
            待同步 {pendingChangesCount} 项
          </Text>
        </View>
      )}

      {/* 同步中 */}
      {isSyncing && (
        <View style={styles.statusRow}>
          <Icon name="sync" size={16} color="#0ea5e9" />
          <Text style={[styles.statusText, { color: '#0ea5e9' }]}>同步中...</Text>
        </View>
      )}

      {/* 最后同步时间 */}
      {lastSyncTime && pendingChangesCount === 0 && !isSyncing && (
        <View style={styles.statusRow}>
          <Icon name="check-circle" size={16} color="#10b981" />
          <Text style={styles.statusText}>已同步 ({formatLastSync()})</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#6b7280',
  },
})

export default SyncStatusBar
