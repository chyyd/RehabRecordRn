// 工作台屏幕 - 使用选择器优化性能
import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Card, Avatar, useTheme } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useAuthStore, selectUserInfo } from '@/stores/authStore'

const HomeScreen = () => {
  const theme = useTheme()
  // ✅ 使用选择器只订阅 userInfo，避免不必要的重新渲染
  const userInfo = useAuthStore(selectUserInfo)

  // 快捷功能菜单
  const quickActions = [
    {
      id: '1',
      title: '今日患者',
      icon: 'people',
      color: '#0ea5e9',
      route: 'TodayPatients',
    },
    {
      id: '2',
      title: '历史记录',
      icon: 'history',
      color: '#8b5cf6',
      route: 'History',
    },
    {
      id: '3',
      title: '治疗项目',
      icon: 'medical-services',
      color: '#10b981',
      route: 'Projects',
    },
    {
      id: '4',
      title: '数据统计',
      icon: 'bar-chart',
      color: '#f59e0b',
      route: 'Statistics',
    },
  ]

  const renderQuickAction = (action: any) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionCard}
      onPress={() => {
        // TODO: 导航到对应页面
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
        <Icon name={action.icon} size={32} color={action.color} />
      </View>
      <Text style={styles.actionTitle}>{action.title}</Text>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
      {/* 欢迎卡片 */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <View style={styles.userInfo}>
              <Avatar.Text
                size={56}
                label={userInfo?.name?.substring(0, 1) || 'U'}
                style={styles.avatar}
              />
              <View style={styles.userText}>
                <Text style={styles.greeting}>
                  您好，{userInfo?.name || '用户'}
                </Text>
                <Text style={styles.role}>
                  {userInfo?.role === 'therapist' && '治疗师'}
                  {userInfo?.role === 'doctor' && '医师'}
                  {userInfo?.role === 'nurse' && '护士'}
                  {userInfo?.role === 'admin' && '管理员'}
                </Text>
              </View>
            </View>
            <Icon name="notifications" size={24} color="#6b7280" />
          </View>
        </Card.Content>
      </Card>

      {/* 快捷功能 */}
      <Text style={styles.sectionTitle}>快捷功能</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map(renderQuickAction)}
      </View>

      {/* 系统信息 */}
      <Text style={styles.sectionTitle}>系统信息</Text>
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoItem}>
            <Icon name="info" size={20} color="#0ea5e9" />
            <Text style={styles.infoText}>系统版本：1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="verified" size={20} color="#10b981" />
            <Text style={styles.infoText}>连接状态：正常</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="cloud-sync" size={20} color="#8b5cf6" />
            <Text style={styles.infoText}>数据同步：已启用</Text>
          </View>
        </Card.Content>
      </Card>

      {/* 底部间距 */}
      <View style={{ height: 24 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  welcomeCard: {
    margin: 16,
    marginBottom: 24,
    elevation: 4,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  userText: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    margin: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 12,
  },
})

export default HomeScreen
