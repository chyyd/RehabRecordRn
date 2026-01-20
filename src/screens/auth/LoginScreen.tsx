// 登录屏幕
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import { TextInput, Button, Checkbox, useTheme } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useAuthStore } from '@/stores/authStore'
import type { LoginDto } from '@/types'
import { ServerSettingsDialog } from '@/components/ServerSettingsDialog'
import { apiClient } from '@/services/api/client'

const LoginScreen = () => {
  const theme = useTheme()
  const { login, isLoading } = useAuthStore()

  const [formData, setFormData] = useState<LoginDto>({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showServerSettings, setShowServerSettings] = useState(false)

  const handleLogin = async () => {
    // 验证表单
    if (!formData.username.trim()) {
      Alert.alert('提示', '请输入用户名')
      return
    }

    if (!formData.password.trim()) {
      Alert.alert('提示', '请输入密码')
      return
    }

    try {
      await login(formData)
      // 登录成功后，导航会自动切换到主界面（由 RootNavigator 处理）
    } catch (error: any) {
      // 检查是否是网络错误
      const errorMessage = error.message || '请检查网络连接和用户信息'
      const isNetworkError =
        errorMessage.includes('网络') ||
        errorMessage.includes('连接') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('ECONNREFUSED')

      if (isNetworkError) {
        Alert.alert(
          '无法连接到服务器',
          '请检查网络连接或服务器设置',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '服务器设置',
              onPress: () => setShowServerSettings(true),
            },
          ]
        )
      } else {
        Alert.alert('登录失败', errorMessage)
      }
    }
  }

  const fillTestAccount = (username: string, password: string) => {
    setFormData({ username, password })
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo 区域 */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>+</Text>
          </View>
          <Text style={styles.appName}>虎林市中医医院</Text>
          <Text style={styles.appDesc}>康复科治疗记录系统</Text>
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          <TextInput
            label="用户名"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
            autoCapitalize="none"
            autoComplete="username"
          />

          <TextInput
            label="密码"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            mode="outlined"
            secureTextEntry={!showPassword}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
            autoComplete="password"
          />

          <View style={styles.checkboxContainer}>
            <Checkbox.Android
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
            />
            <Text style={styles.checkboxLabel}>记住密码</Text>
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
          >
            {isLoading ? '登录中...' : '登录'}
          </Button>

          {/* 服务器设置按钮 */}
          <TouchableOpacity
            style={styles.serverSettingsButton}
            onPress={() => setShowServerSettings(true)}
          >
            <Icon name="settings" size={20} color="#6b7280" />
            <Text style={styles.serverSettingsText}>服务器设置</Text>
          </TouchableOpacity>
        </View>

        {/* 测试账号提示 */}
        <View style={styles.testAccountsContainer}>
          <Text style={styles.testAccountsTitle}>测试账号（点击自动填充）</Text>
          <View style={styles.testAccountButtons}>
            <Button
              mode="outlined"
              onPress={() => fillTestAccount('yyd', '123456')}
              style={styles.testButton}
              compact
            >
              yyd
            </Button>
            <Button
              mode="outlined"
              onPress={() => fillTestAccount('admin', '123456')}
              style={styles.testButton}
              compact
            >
              管理员
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* 服务器设置对话框 */}
      <ServerSettingsDialog
        visible={showServerSettings}
        onDismiss={() => setShowServerSettings(false)}
        onSave={(serverUrl) => {
          // 更新API客户端的服务器地址
          apiClient.updateBaseUrl(serverUrl)
          Alert.alert('成功', `服务器地址已更新为：${serverUrl}`)
        }}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoIcon: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  appDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  loginButton: {
    marginBottom: 16,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  serverSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  serverSettingsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  testAccountsContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  testAccountsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 12,
    textAlign: 'center',
  },
  testAccountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  testButton: {
    flex: 1,
    minWidth: 80,
    marginHorizontal: 4,
  },
})

export default LoginScreen
