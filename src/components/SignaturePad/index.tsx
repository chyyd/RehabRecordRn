// 电子签名组件
import React, { useRef, useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native'
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

  const handleOK = (signature: string) => {
    // signature 是 base64 编码的图片数据
    onConfirm(signature)
    onClose()
  }

  const handleEmpty = (empty: boolean) => {
    setIsEmpty(empty)
  }

  const handleClear = () => {
    signatureRef.current?.clearSignature()
  }

  const handleConfirm = () => {
    if (isEmpty) {
      Alert.alert('提示', '请先签名')
      return
    }
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
        </View>

        {/* 签名区域 */}
        <View style={styles.signatureContainer}>
          <SignatureScreen
            ref={signatureRef}
            onOK={handleOK}
            onEmpty={handleEmpty}
            onClear={handleEmpty}
            autoClear={false}
            descriptionText=""
            clearText="清空"
            confirmText="确认"
            webStyle={`
              .m-signature-pad {
                box-shadow: none;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
              }
              .m-signature-pad--body {
                background-color: #ffffff;
              }
              .m-signature-pad--footer {
                display: none;
              }
              body {
                margin: 0;
                padding: 0;
              }
            `}
          />
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
    paddingVertical: 16,
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
  signatureContainer: {
    flex: 1,
    margin: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerButton: {
    flex: 1,
  },
})

export default SignaturePad
