// 主应用导航（已登录状态）- 类型安全版本
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import Icon from 'react-native-vector-icons/MaterialIcons'
import type { MainStackParamList, TabParamList } from './types'

// 导入屏幕组件
import PatientListScreen from '@/screens/patients/PatientListScreen'
import PatientDetailScreen from '@/screens/patients/PatientDetailScreen'
import ScanScreen from '@/screens/scanner/ScanScreen'
import { QRScannerScreen } from '@/screens/scanner/QRScannerScreen'
import HomeScreen from '@/screens/home/HomeScreen'
import CreateRecordScreen from '@/screens/records/CreateRecordScreen'
import RecordDetailScreen from '@/screens/records/RecordDetailScreen'
import RecordHistoryScreen from '@/screens/records/RecordHistoryScreen'

const Tab = createBottomTabNavigator<TabParamList>()
const Stack = createStackNavigator<MainStackParamList>()

/**
 * 底部 Tab 导航器
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          switch (route.name) {
            case 'Patients':
              iconName = 'people'
              break
            case 'Scan':
              iconName = 'qr-code'
              break
            case 'Home':
              iconName = 'home'
              break
            default:
              iconName = 'circle'
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#7A7E83',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Patients"
        component={PatientListScreen}
        options={{ tabBarLabel: '患者列表' }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{ tabBarLabel: '扫码' }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: '工作台' }}
      />
    </Tab.Navigator>
  )
}

/**
 * 主导航器（包含 Tab 和 Stack）
 */
export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0ea5e9',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{ title: '患者详情' }}
      />
      <Stack.Screen
        name="CreateRecord"
        component={CreateRecordScreen}
        options={{ title: '创建治疗记录' }}
      />
      <Stack.Screen
        name="RecordDetail"
        component={RecordDetailScreen}
        options={{ title: '记录详情' }}
      />
      <Stack.Screen
        name="RecordHistory"
        component={RecordHistoryScreen}
        options={{ title: '历史记录' }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          title: '扫描二维码',
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  )
}
