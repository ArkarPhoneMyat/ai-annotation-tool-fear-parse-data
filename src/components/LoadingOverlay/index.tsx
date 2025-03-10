import React from 'react'
import { ActivityIndicator, Modal, View } from 'react-native'
import TextComponent from '../Text'
import { Colors } from '@/assets/styles'
interface Props {
  isVisible: boolean,
  shouldShowError?: boolean,
  errorMessage?: string
  title?: string
}
const LoadingOverlay = ({ isVisible, shouldShowError = false, errorMessage, title = 'Processing...' }: Props) => {
  return (
    <Modal visible={isVisible} style={{ flex: 1 }} supportedOrientations={['portrait', 'landscape']}>
      {!shouldShowError && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
          <TextComponent>{title}</TextComponent>
        </View>
      )}
      {shouldShowError && (
        <TextComponent style={[{ color: Colors.primaryBlue }]}>
          {errorMessage}
        </TextComponent>
      )}
    </Modal>
  )
}

export default LoadingOverlay