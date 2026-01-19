// 认证流程导航（未登录状态）- 类型安全版本
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import type { AuthStackParamList } from './types'

// 导入屏幕组件
import SplashScreen from '@/screens/auth/SplashScreen'
import LoginScreen from '@/screens/auth/LoginScreen'

const Stack = createStackNavigator<AuthStackParamList>()

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}
