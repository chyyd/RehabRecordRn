// 网络状态监听 Hook
import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useSyncStore } from '@/stores/syncStore'

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true)
  const { setOnlineStatus } = useSyncStore()

  useEffect(() => {
    // 获取初始网络状态
    const fetchInitialState = async () => {
      const state = await NetInfo.fetch()
      const isConnected = state.isConnected ?? false
      const isInternetReachable = state.isInternetReachable ?? false

      const online = isConnected && isInternetReachable
      setIsOnline(online)
      setOnlineStatus(online)
    }

    fetchInitialState()

    // 监听网络状态变化
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false
      const isInternetReachable = state.isInternetReachable ?? false

      const online = isConnected && isInternetReachable
      setIsOnline(online)
      setOnlineStatus(online)
    })

    return () => {
      unsubscribe()
    }
  }, [setOnlineStatus])

  return isOnline
}
