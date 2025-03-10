
import React from 'react'
import { View } from 'react-native'
import Text from '../Text'
import { Colors } from '@/assets/styles'


interface Props {
  title: string,
  backgroundColor: string,
}

const PlayerCard = ({ title, backgroundColor }: Props) => {
  return <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ backgroundColor: backgroundColor, width: 20, height: 20, borderRadius: 10, marginRight: 2 }} />
    <View style={{ backgroundColor: Colors.white, paddingHorizontal: 4 }}>
      <Text style={{ color: Colors.black }}>{title}</Text>
    </View>
  </View>
}

export default PlayerCard