const React = require('react')

function SignatureCanvas(props) {
  return React.createElement('View', { testID: 'signature-canvas' }, props.children || null)
}

module.exports = SignatureCanvas
