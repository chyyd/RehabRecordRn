/**
 * 优化的图片组件
 * 基于react-native-fast-image，提供更好的缓存和性能
 */

import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import FastImage from 'react-native-fast-image'

interface OptimizedImageProps {
  uri: string
  style?: any
  width?: number
  height?: number
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center'
  placeholder?: any
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  style,
  width,
  height,
  resizeMode = 'cover',
  placeholder,
}) => {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  const handleLoadStart = () => {
    setLoading(true)
    setError(false)
  }

  const handleLoadEnd = () => {
    setLoading(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  const imageStyle = {
    width,
    height,
    ...style,
  }

  if (error && placeholder) {
    return <>{placeholder}</>
  }

  return (
    <View style={imageStyle}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0ea5e9" />
        </View>
      )}
      <FastImage
        source={{
          uri,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        style={[styles.image, imageStyle]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
})

export default OptimizedImage
