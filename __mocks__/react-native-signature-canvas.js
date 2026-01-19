const React = require('react')
const { useEffect, forwardRef, useImperativeHandle } = React

const SignatureCanvas = forwardRef((props, ref) => {
  const { onOK, onEmpty, onClear } = props

  // 初始化时调用onEmpty(true)，表示签名板为空
  useEffect(() => {
    if (onEmpty) {
      onEmpty(true)
    }
  }, [])

  // 暴露API方法给ref
  useImperativeHandle(ref, () => ({
    clearSignature: () => {
      if (onClear) {
        onClear(true)
      }
      if (onEmpty) {
        onEmpty(true)
      }
    },
    readSignature: () => {
      if (onOK) {
        onOK('data:image/png;base64,mocksignature')
      }
    },
  }))

  return React.createElement('View', { testID: 'signature-canvas' }, props.children || null)
})

module.exports = SignatureCanvas
