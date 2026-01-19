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
} from 'react-native'
import { TextInput, Button, Checkbox, useTheme } from 'react-native-paper'
import { useAuthStore } from '@/stores/authStore'
import type { LoginDto } from '@/types'

const LoginScreen = () => {
  const theme = useTheme()
  const { login, isLoading } = useAuthStore()

  const [formData, setFormData] = useState<LoginDto>({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

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
      Alert.alert('登录失败', error.message || '请检查网络连接和用户信息')
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
        </View>

        {/* 测试账号提示 */}
        <View style={styles.testAccountsContainer}>
          <Text style={styles.testAccountsTitle}>测试账号（点击自动填充）</Text>
          <View style={styles.testAccountButtons}>
            <Button
              mode="outlined"
              onPress={() => fillTestAccount('admin', 'admin123')}
              style={styles.testButton}
              compact
            >
              管理员
            </Button>
            <Button
              mode="outlined"
              onPress={() => fillTestAccount('therapist', 'therapist123')}
              style={styles.testButton}
              compact
            >
              治疗师
            </Button>
            <Button
              mode="outlined"
              onPress={() => fillTestAccount('doctor', 'doctor123')}
              style={styles.testButton}
              compact
            >
              医师
            </Button>
            <Button
              mode="outlined"
              onPress={() => fillTestAccount('nurse', 'nurse123')}
              style={styles.testButton}
              compact
            >
              护士
            </Button>
          </View>
        </View>
      </ScrollView>
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
