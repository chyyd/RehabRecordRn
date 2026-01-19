// 启动屏幕
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, StatusBar } from 'react-native'
import { useAuthStore } from '@/stores/authStore'
import { createLogger } from '@/utils/logger'

const logger = createLogger('SplashScreen')

const SplashScreen = () => {
  const { isAuthenticated, init } = useAuthStore()

  useEffect(() => {
    // 初始化认证状态
    const prepare = async () => {
      try {
        await init()
      } catch (error) {
        logger.error('初始化失败', error)
      }
    }

    // 延迟 1.5 秒显示启动画面
    const timer = setTimeout(() => {
      prepare()
    }, 1500)

    return () => clearTimeout(timer)
  }, [init])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0ea5e9" />
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>+</Text>
        </View>
        <Text style={styles.appName}>虎林市中医医院</Text>
        <Text style={styles.appDesc}>康复科治疗记录系统</Text>
      </View>
      <Text style={styles.version}>版本 1.0.0</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  appDesc: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.7,
  },
})

export default SplashScreen
