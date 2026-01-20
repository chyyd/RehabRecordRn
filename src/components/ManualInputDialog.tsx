/**
 * 手动输入病历号对话框
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import { TextInput, Button, useTheme } from 'react-native-paper'

interface ManualInputDialogProps {
  visible: boolean
  onDismiss: () => void
  onConfirm: (medicalNo: string) => void
}

export const ManualInputDialog: React.FC<ManualInputDialogProps> = ({
  visible,
  onDismiss,
  onConfirm,
}) => {
  const theme = useTheme()
  const [medicalNo, setMedicalNo] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    // 验证输入
    if (!medicalNo.trim()) {
      setError('请输入病历号')
      return
    }

    // 简单验证：3-10位数字或字母数字组合
    const isValid = /^[A-Za-z0-9]{3,10}$/.test(medicalNo.trim())
    if (!isValid) {
      setError('病历号格式不正确（3-10位数字或字母）')
      return
    }

    onConfirm(medicalNo.trim())

    // 清空输入
    setMedicalNo('')
    setError('')
  }

  const handleDismiss = () => {
    // 清空输入和错误
    setMedicalNo('')
    setError('')
    onDismiss()
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              {/* 标题 */}
              <View style={styles.header}>
                <Text style={styles.title}>手动输入病历号</Text>
                <TouchableOpacity onPress={handleDismiss}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* 说明文本 */}
              <Text style={styles.description}>
                请输入患者的病历号后3位或完整病历号
              </Text>

              {/* 输入框 */}
              <TextInput
                label="病历号"
                value={medicalNo}
                onChangeText={(text) => {
                  setMedicalNo(text)
                  setError('') // 清除错误
                }}
                mode="outlined"
                placeholder="例如：321 或 150321"
                error={!!error}
                style={styles.input}
                autoCapitalize="characters"
                autoComplete="off"
                autoFocus
              />

              {/* 错误提示 */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              {/* 提示信息 */}
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>💡 输入提示</Text>
                <Text style={styles.tipsText}>
                  • 病历号后3位：快速查找（如：321）
                </Text>
                <Text style={styles.tipsText}>
                  • 完整病历号：精确匹配（如：150321）
                </Text>
              </View>

              {/* 操作按钮 */}
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleDismiss}
                  style={styles.cancelButton}
                >
                  取消
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  disabled={!medicalNo.trim()}
                  style={styles.confirmButton}
                >
                  确认
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 12,
  },
  tipsContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#0c4a6e',
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
})

export default ManualInputDialog
