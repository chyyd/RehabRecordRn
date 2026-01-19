// 根导航器 - 根据认证状态决定导航流程
import React, { useEffect, useState, useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuthStore } from '@/stores/authStore'
import { setNavigationRef } from '@/services/api/client'
import { createLogger } from '@/utils/logger'

import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'

const logger = createLogger('RootNavigator')

export default function RootNavigator() {
  const { isAuthenticated, token, init } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(true)
  const navigationRef = useRef<any>(null)

  useEffect(() => {
    // 设置导航引用供API客户端使用（401跳转）
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current)
    }
  }, [isAuthenticated])

  useEffect(() => {
    // 初始化认证状态
    const prepare = async () => {
      try {
        await init()
      } catch (error) {
        logger.error('初始化失败', error)
      } finally {
        setIsInitializing(false)
      }
    }

    prepare()
  }, [init])

  if (isInitializing) {
    // TODO: 显示启动加载动画
    return null
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated && token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}
