/**
 * 服务器设置对话框
 * 用于配置API服务器地址
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import { TextInput, Button, useTheme } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createLogger } from '@/utils/logger'

const logger = createLogger('ServerSettings')

const STORAGE_KEY = '@rehab/server_url'

interface ServerSettingsDialogProps {
  visible: boolean
  onDismiss: () => void
  onSave?: (serverUrl: string) => void
}

export const ServerSettingsDialog: React.FC<ServerSettingsDialogProps> = ({
  visible,
  onDismiss,
  onSave,
}) => {
  const theme = useTheme()
  const [serverUrl, setServerUrl] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [testing, setTesting] = useState(false)

  // 加载保存的服务器地址
  useEffect(() => {
    loadServerUrl()
  }, [])

  const loadServerUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(STORAGE_KEY)
      if (savedUrl) {
        setServerUrl(savedUrl)
      } else {
        // 默认值
        setServerUrl('http://localhost:3000')
      }
    } catch (error) {
      logger.error('加载服务器地址失败', error)
    }
  }

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false

    // 使用正则表达式验证URL，兼容性更好
    const urlPattern = /^https?:\/\/.+:\d+$/
    return urlPattern.test(url.trim())
  }

  const handleUrlChange = (text: string) => {
    setServerUrl(text)
    setIsValid(validateUrl(text) || text.trim() === '')
  }

  const handleSave = async () => {
    if (!validateUrl(serverUrl)) {
      setIsValid(false)
      return
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, serverUrl)
      logger.info('服务器地址已保存:', serverUrl)
      onSave?.(serverUrl)
      onDismiss()
    } catch (error) {
      logger.error('保存服务器地址失败', error)
    }
  }

  const handleTestConnection = async () => {
    if (!validateUrl(serverUrl)) {
      setIsValid(false)
      return
    }

    setTesting(true)
    try {
      // 尝试连接服务器
      const response = await fetch(`${serverUrl}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      })

      if (response.ok || response.status === 401) {
        // 200 OK 或 401 未授权都说明服务器可访问
        logger.info('服务器连接测试成功')
        alert('✅ 服务器连接成功！')
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error: any) {
      logger.error('服务器连接测试失败', error)
      alert(`❌ 连接失败: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  const handleReset = async () => {
    const defaultUrl = 'http://localhost:3000'
    setServerUrl(defaultUrl)
    await AsyncStorage.setItem(STORAGE_KEY, defaultUrl)
    logger.info('服务器地址已重置为默认值')
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              {/* 标题 */}
              <View style={styles.header}>
                <Text style={styles.title}>服务器设置</Text>
                <TouchableOpacity onPress={onDismiss}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* 说明文本 */}
              <Text style={styles.description}>
                如果无法连接到服务器，请检查服务器地址是否正确。
              </Text>

              {/* 服务器地址输入框 */}
              <TextInput
                label="服务器地址"
                value={serverUrl}
                onChangeText={handleUrlChange}
                mode="outlined"
                placeholder="http://localhost:3000"
                error={!isValid}
                style={styles.input}
                autoCapitalize="none"
                autoComplete="url"
                keyboardType="url"
              />

              {!isValid && (
                <Text style={styles.errorText}>
                  请输入有效的URL地址（例如：http://192.168.1.100:3000）
                </Text>
              )}

              {/* 常用地址预设 */}
              <Text style={styles.presetTitle}>常用地址：</Text>
              <View style={styles.presetButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setServerUrl('http://localhost:3000')}
                  style={styles.presetButton}
                  compact
                >
                  本地
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setServerUrl('http://192.168.10.5:3000')}
                  style={styles.presetButton}
                  compact
                >
                  局域网
                </Button>
              </View>

              {/* 操作按钮 */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleReset}
                  style={styles.resetButton}
                  compact
                >
                  重置
                </Button>
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={handleTestConnection}
                    loading={testing}
                    disabled={testing}
                    style={styles.testButton}
                    compact
                  >
                    测试连接
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSave}
                    disabled={!isValid || !serverUrl.trim()}
                    style={styles.saveButton}
                    compact
                  >
                    保存
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 12,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  presetButton: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  resetButton: {
    width: '100%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
})

/**
 * 获取保存的服务器地址
 */
export async function getServerUrl(): Promise<string> {
  try {
    const savedUrl = await AsyncStorage.getItem(STORAGE_KEY)
    return savedUrl || 'http://localhost:3000'
  } catch (error) {
    logger.error('获取服务器地址失败', error)
    return 'http://localhost:3000'
  }
}

export default ServerSettingsDialog
