/**
 * 扫码功能主屏幕
 * 提供扫码和手动输入两种方式
 */

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Button } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { ManualInputDialog } from '@/components/ManualInputDialog'
import type { MainNavigationProp } from '@/navigation'

const ScanScreen = () => {
  const navigation = useNavigation<MainNavigationProp>()
  const route = useRoute()
  const [showManualInput, setShowManualInput] = useState(false)

  // 监听扫码结果
  useEffect(() => {
    const params = route.params as any
    if (params?.scannedCode) {
      handleScannedCode(params.scannedCode)
    }
  }, [route.params])

  const handleScanPress = () => {
    // 导航到QR码扫描器，传递来源屏幕信息
    navigation.navigate('QRScanner', { sourceScreen: 'Scan' })
  }

  const handleScannedCode = (code: string) => {
    // TODO: 根据扫描的码内容进行相应处理
    // 例如：查找患者、跳转到患者详情等
    Alert.alert('扫描成功', `扫描结果：${code}`, [
      {
        text: '查看患者',
        onPress: () => {
          // 假设扫描的是患者ID或病历号，转换为数字
          const patientId = parseInt(code, 10)
          if (!isNaN(patientId)) {
            navigation.navigate('PatientDetail', { patientId })
          } else {
            Alert.alert('错误', '无效的患者ID')
          }
        },
      },
      {
        text: '取消',
        style: 'cancel',
      },
    ])
  }

  const handleManualInputConfirm = (medicalNo: string) => {
    // 关闭对话框
    setShowManualInput(false)

    // TODO: 根据病历号查找患者
    // 这里可以调用API查找患者，然后跳转到患者详情
    Alert.alert('查找患者', `正在查找病历号：${medicalNo}`, [
      {
        text: '查看患者',
        onPress: () => {
          // 查找成功后跳转到患者详情（转换为数字）
          const patientId = parseInt(medicalNo, 10)
          if (!isNaN(patientId)) {
            navigation.navigate('PatientDetail', { patientId })
          } else {
            Alert.alert('错误', '无效的患者ID')
          }
        },
      },
      {
        text: '取消',
        style: 'cancel',
      },
    ])
  }

  const handleManualInput = () => {
    // 显示手动输入对话框
    setShowManualInput(true)
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 扫码图标 */}
        <View style={styles.iconContainer}>
          <Icon name="qr-code" size={120} color="#0ea5e9" />
        </View>

        <Text style={styles.title}>扫描患者二维码</Text>
        <Text style={styles.description}>
          扫描患者腕带上的二维码或条形码，快速查看患者信息
        </Text>

        {/* 扫码按钮 */}
        <Button
          mode="contained"
          onPress={handleScanPress}
          style={styles.scanButton}
          contentStyle={styles.scanButtonContent}
          icon="qr-code"
        >
          开始扫码
        </Button>

        {/* 手动输入 */}
        <TouchableOpacity
          style={styles.manualInputButton}
          onPress={handleManualInput}
        >
          <Text style={styles.manualInputText}>手动输入病历号</Text>
        </TouchableOpacity>

        {/* 使用提示 */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>使用提示</Text>
          <Text style={styles.tipsText}>• 确保相机权限已开启</Text>
          <Text style={styles.tipsText}>• 保持二维码在取景框内</Text>
          <Text style={styles.tipsText}>• 避免强光直射影响识别</Text>
        </View>
      </View>

      {/* 手动输入对话框 */}
      <ManualInputDialog
        visible={showManualInput}
        onDismiss={() => setShowManualInput(false)}
        onConfirm={handleManualInputConfirm}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#f0f9ff',
    borderRadius: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  scanButton: {
    width: '100%',
    marginBottom: 16,
  },
  scanButtonContent: {
    paddingVertical: 12,
  },
  manualInputButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    marginBottom: 40,
  },
  manualInputText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0ea5e9',
    textAlign: 'center',
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
})

export default ScanScreen
