/**
 * 康复科治疗记录系统 - React Native 原生应用
 * 虎林市中医医院
 */

import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import ErrorBoundary from '@/components/ErrorBoundary'
import { RootNavigator } from '@/navigation'
import { apiClient } from '@/services/api/client'

// 自定义主题配置
const theme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#0ea5e9',
    primaryContainer: '#e0f2fe',
    secondary: '#8b5cf6',
    secondaryContainer: '#f3e8ff',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f3f4f6',
    error: '#ef4444',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#1f2937',
    onSurface: '#1f2937',
    onError: '#ffffff',
  },
}

function App(): React.JSX.Element {
  useEffect(() => {
    // 初始化API客户端（加载保存的服务器地址）
    apiClient.initialize()
  }, [])

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <PaperProvider theme={theme}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <RootNavigator />
        </PaperProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}

export default App
