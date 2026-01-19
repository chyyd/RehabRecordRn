// 错误边界组件 - 捕获运行时错误
import React, { Component, ReactNode } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Button } from 'react-native-paper'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ErrorBoundary')

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，显示友好的错误界面
 * 并提供重置应用的功能
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 可以将错误日志上报给服务器
    logger.error('捕获到错误', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>

            <Text style={styles.title}>应用出错了</Text>

            <ScrollView style={styles.errorContainer}>
              <Text style={styles.errorMessage}>
                {this.state.error?.toString() || '未知错误'}
              </Text>
            </ScrollView>

            <Text style={styles.description}>
                很抱歉，应用遇到了意外错误。您可以尝试重启应用或联系技术支持。
              </Text>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={this.handleReset}
                style={styles.resetButton}
              >
                重新加载
              </Button>
            </View>

            <Text style={styles.version}>
              版本 1.0.0 | 虎林市中医医院康复科
            </Text>
          </View>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    maxHeight: 200,
    width: '100%',
  },
  errorMessage: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'monospace',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 32,
  },
  resetButton: {
    marginBottom: 24,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
  },
})

export default ErrorBoundary
