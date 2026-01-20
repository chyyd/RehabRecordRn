// 电子签名组件
import React, { useRef, useState, useEffect } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import SignatureScreen from 'react-native-signature-canvas'
import Orientation from 'react-native-orientation-locker'

interface SignaturePadProps {
  visible: boolean
  onConfirm: (signature: string) => void
  onClose: () => void
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  visible,
  onConfirm,
  onClose,
}) => {
  const signatureRef = useRef<any>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [hasSigned, setHasSigned] = useState(false)
  const [containerHeight, setContainerHeight] = useState(0)

  // 处理屏幕方向切换
  useEffect(() => {
    if (visible) {
      // 进入签名页：锁定为横屏（逆时针旋转90度）
      Orientation.lockToLandscapeRight()
    } else {
      // 退出签名页：恢复竖屏
      Orientation.lockToPortrait()
    }

    // 组件卸载时恢复竖屏
    return () => {
      Orientation.lockToPortrait()
    }
  }, [visible])

  // 获取容器布局
  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout
    console.log('📐 签名容器尺寸:', { width, height })
    setContainerHeight(height)
  }

  const handleOK = (signature: string) => {
    // signature 是 base64 编码的图片数据
    console.log('✅ 签名确认，数据长度:', signature.length)
    onConfirm(signature)
    onClose()
  }

  const handleBegin = () => {
    console.log('✍️ 开始签名')
    setHasSigned(true)
    setIsEmpty(false)
  }

  const handleEnd = () => {
    console.log('🏁 结束签名')
    if (hasSigned) {
      setIsEmpty(false)
    }
  }

  const handleClear = () => {
    console.log('🧹 清空签名')
    signatureRef.current?.clearSignature()
    setIsEmpty(true)
    setHasSigned(false)
  }

  const handleConfirm = () => {
    console.log('🔘 点击确认按钮，当前 isEmpty:', isEmpty)
    console.log('✅ 读取签名数据')
    signatureRef.current?.readSignature()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 顶部操作栏 - 包含三个按钮 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClear}
            style={[styles.headerButton, styles.clearButton]}
          >
            <Text style={styles.clearButtonText}>清空重签</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.headerButton, styles.confirmButton]}
            disabled={isEmpty}
          >
            <Text style={[
              styles.confirmButtonText,
              isEmpty && styles.confirmButtonTextDisabled
            ]}>
              确认签名
            </Text>
          </TouchableOpacity>
        </View>

        {/* 签名区域 - 移除边距以最大化空间 */}
        <View style={styles.signatureContainer} onLayout={handleLayout}>
          {containerHeight > 0 && (
            <SignatureScreen
              ref={signatureRef}
              onOK={handleOK}
              onBegin={handleBegin}
              onEnd={handleEnd}
              autoClear={false}
              descriptionText=""
              bgStrokeWidth={0} // 移除背景网格
              clearText="清空"
              confirmText="确认"
              penColor="black" // 设置笔迹颜色为黑色
              backgroundColor="#ffffff" // 设置背景色为白色
              dataURL="" // 初始化为空
              dotSize={2} // 笔锋效果：点大小，减半以获得适中笔画
              minWidth={2} // 笔锋效果：最小线宽，减半
              maxWidth={5} // 笔锋效果：最大线宽，减半
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: none;
                  border-radius: 0;
                  margin: 0 auto;
                }
                .m-signature-pad--body {
                  background-color: #ffffff;
                  touch-action: none;
                }
                .m-signature-pad--footer {
                  display: none;
                }
                body, html {
                  margin: 0;
                  padding: 0;
                  touch-action: none;
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  position: relative;
                  background-color: #ffffff;
                }
                canvas {
                  touch-action: none;
                  width: 100%;
                  height: 100%;
                  display: block;
                  background-color: #ffffff;
                }
              `}
            />
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 7, // 60% of 12
    paddingVertical: 5, // 60% of 8
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 26, // 60% of 44
  },
  headerButton: {
    padding: 2, // 60% of 4
    minWidth: 30, // 60% of 50
  },
  headerButtonText: {
    fontSize: 15, // 保持原大小
    color: '#6b7280',
  },
  clearButton: {
    backgroundColor: '#fff7ed', // 浅橙色背景
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 15,
    color: '#ea580c', // 橙色文字
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#0ea5e9', // 蓝色背景
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confirmButtonText: {
    fontSize: 15,
    color: '#ffffff', // 白色文字
    fontWeight: '600',
  },
  confirmButtonTextDisabled: {
    opacity: 0.5,
  },
  signatureContainer: {
    // 使用 flex: 1 让签名区域自动填充剩余空间
    flex: 1,
    margin: 8, // 减小边距从 16 到 8
    marginBottom: 4,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
    justifyContent: 'center', // 垂直居中
    alignItems: 'center', // 水平居中
  },
})

export default SignaturePad
