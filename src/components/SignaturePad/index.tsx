// 电子签名组件
import React, { useRef, useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, LayoutChangeEvent } from 'react-native'
import { Button, useTheme } from 'react-native-paper'
import SignatureScreen from 'react-native-signature-canvas'

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
  const theme = useTheme()
  const signatureRef = useRef<any>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [hasSigned, setHasSigned] = useState(false)
  const [containerHeight, setContainerHeight] = useState(0)

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout
    console.log('📐 签名容器尺寸:', { height })
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
        {/* 标题栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>签名确认</Text>
          <TouchableOpacity
            onPress={handleClear}
            style={styles.headerButton}
          >
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              清空
            </Text>
          </TouchableOpacity>
        </View>

        {/* 提示文字 */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>请在下方区域签名</Text>
          <Text style={styles.tipSubtext}>签名将用于治疗记录确认</Text>
          <Text style={styles.tipStatus}>
            状态: {isEmpty ? '等待签名...' : '已签名 ✓'}
          </Text>
        </View>

        {/* 签名区域 */}
        <View style={styles.signatureContainer} onLayout={handleLayout}>
          {containerHeight > 0 && (
            <SignatureScreen
              ref={signatureRef}
              onOK={handleOK}
              onBegin={handleBegin}
              onEnd={handleEnd}
              autoClear={false}
              descriptionText=""
              webStyle={`
                .m-signature-pad {
                  box-shadow: none;
                  border: none;
                  border-radius: 0;
                  width: 100vw;
                  height: ${containerHeight}px;
                  position: absolute;
                  top: 0;
                  left: 0;
                }
                .m-signature-pad--body {
                  background-color: #ffffff;
                  width: 100%;
                  height: 100%;
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
                }
                canvas {
                  touch-action: none;
                  width: 100%;
                  height: 100%;
                  display: block;
                }
              `}
            />
          )}
        </View>

        {/* 底部按钮 */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={handleClear}
            style={styles.footerButton}
          >
            清空重签
          </Button>
          <Button
            mode="contained"
            onPress={handleConfirm}
            style={styles.footerButton}
            disabled={isEmpty}
          >
            确认签名
          </Button>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tipContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  tipSubtext: {
    fontSize: 13,
    color: '#6b7280',
  },
  tipStatus: {
    fontSize: 12,
    color: '#0ea5e9',
    marginTop: 4,
  },
  signatureContainer: {
    // 使用 flex: 1 让签名区域自动填充剩余空间
    flex: 1,
    margin: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#ffffff',
  },
  footerButton: {
    flex: 1,
  },
})

export default SignaturePad
