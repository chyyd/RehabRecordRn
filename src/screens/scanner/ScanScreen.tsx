// 扫码屏幕（框架版本 - 实际扫码功能需要后续添加相机权限和库）
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Button } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialIcons'

const ScanScreen = () => {
  const handleScanPress = () => {
    // TODO: 实现扫码功能
    // 需要集成 react-native-camera
    Alert.alert(
      '扫码功能',
      '扫码功能将在后续阶段实现。\n\n需要安装 react-native-camera 并配置相机权限。'
    )
  }

  const handleManualInput = () => {
    // TODO: 实现手动输入病历号功能
    Alert.alert('手动输入', '手动输入病历号功能将在后续阶段实现。')
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* 扫码图标 */}
        <View style={styles.iconContainer}>
          <Icon name="qr-code-scanner" size={120} color="#0ea5e9" />
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
          <Text style={styles.tipsText}>
            • 确保相机权限已开启
          </Text>
          <Text style={styles.tipsText}>
            • 保持二维码在取景框内
          </Text>
          <Text style={styles.tipsText}>
            • 避免强光直射影响识别
          </Text>
        </View>
      </View>
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
