/**
 * QR码扫描器屏幕
 * 使用 react-native-vision-camera 实现QR码和条形码扫描
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native'
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera'
import Icon from 'react-native-vector-icons/MaterialIcons'

interface QRScannerScreenProps {
  onCodeScanned: (code: string) => void
  onClose?: () => void
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({
  onCodeScanned,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(true)
  const [torchEnabled, setTorchEnabled] = useState(false)
  const hasScannedRef = useRef(false)

  // 检查相机权限
  const { hasPermission, requestPermission } = useCameraPermission()

  // 获取后置相机设备
  const device = useCameraDevice('back')

  // 配置扫码器
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: (codes) => {
      if (!isScanning || hasScannedRef.current) return

      const code = codes[0]
      if (!code) return

      hasScannedRef.current = true
      setIsScanning(false)

      // 震动反馈
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Haptics.ImpactFeedbackStyle.Light 需要 react-native 的 Haptics API
        // 这里简化处理，直接调用回调
      }

      // 显示扫描结果并确认
      Alert.alert(
        '扫描成功',
        `扫描到码：${code.value}`,
        [
          {
            text: '取消',
            onPress: () => {
              hasScannedRef.current = false
              setIsScanning(true)
            },
            style: 'cancel',
          },
          {
            text: '确认',
            onPress: () => {
              onCodeScanned(code.value)
            },
          },
        ],
        { cancelable: false }
      )
    },
  })

  // 请求权限
  useEffect(() => {
    if (!hasPermission) {
      requestPermission().then((granted) => {
        if (!granted) {
          Alert.alert(
            '需要相机权限',
            '请在设置中开启相机权限以使用扫码功能',
            [
              { text: '取消', onPress: onClose },
              { text: '去设置', onPress: () => {
                // 可以打开应用设置页面
              }},
            ]
          )
        }
      })
    }
  }, [hasPermission, requestPermission, onClose])

  // 无权限状态
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="no-photography" size={64} color="#9ca3af" />
        <Text style={styles.permissionTitle}>需要相机权限</Text>
        <Text style={styles.permissionText}>
          请授予相机权限以使用扫码功能
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => requestPermission()}
        >
          <Text style={styles.permissionButtonText}>请求权限</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // 无相机设备状态
  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-alt" size={64} color="#9ca3af" />
        <Text style={styles.permissionTitle}>无法访问相机</Text>
        <Text style={styles.permissionText}>
          未检测到可用的相机设备
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 相机视图 */}
      <Camera
        style={styles.camera}
        device={device}
        isActive={isScanning}
        codeScanner={codeScanner}
        torch={torchEnabled ? 'on' : 'off'}
        enableZoomGesture={true}
      />

      {/* 扫描框覆盖层 */}
      <View style={styles.overlay}>
        {/* 顶部栏 */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>扫描二维码</Text>
          <TouchableOpacity
            style={styles.torchButton}
            onPress={() => setTorchEnabled(!torchEnabled)}
          >
            <Icon
              name={torchEnabled ? 'flash-on' : 'flash-off'}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        {/* 扫描区域 */}
        <View style={styles.scanArea}>
          <View style={styles.scanCorner} />
          <View style={[styles.scanCorner, styles.scanCornerRight]} />
          <View style={[styles.scanCorner, styles.scanCornerBottom]} />
          <View style={[styles.scanCorner, styles.scanCornerRight, styles.scanCornerBottom]} />

          <Text style={styles.scanHint}>
            将二维码放入框内{'\n'}即可自动扫描
          </Text>
        </View>

        {/* 底部提示 */}
        <View style={styles.bottomBar}>
          <Text style={styles.bottomText}>
            支持二维码、条形码等多种格式
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  torchButton: {
    padding: 8,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scanArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 60,
  },
  scanCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ffffff',
    top: 0,
    left: 0,
  },
  scanCornerRight: {
    left: undefined,
    right: 0,
    borderTopWidth: 3,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  scanCornerBottom: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  scanHint: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
})

export default QRScannerScreen
