import { Colors } from '@/assets/styles';
import { Text } from '@/components';
import React from 'react';
import { View } from 'react-native';

interface Props {
  mWidth: number,
  namePlayer1: string,
  namePlayer2: string,
  scoredPlayer1: number,
  scoredPlayer2: number
}

const ScoreBardCard = ({ mWidth, namePlayer1, namePlayer2, scoredPlayer1, scoredPlayer2 }: Props) => {
  return <View style={{ height: 80, width: mWidth, flexDirection: 'row', paddingRight: 2 }}>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', flex: 1, paddingHorizontal: 4, justifyContent: 'center' }}>
          <Text style={{ color: Colors.white, textAlign: 'center', fontSize: 10 }}>{namePlayer1}</Text>
        </View>
        <Text style={{ color: Colors.white }}>VS</Text>
        <View style={{ flexDirection: 'row', flex: 1, paddingHorizontal: 4, justifyContent: 'center' }}>
          <Text style={{ color: Colors.white, textAlign: 'center', fontSize: 10 }}>{namePlayer2}</Text>
        </View>
      </View>
      <View style={{ borderBottomWidth: 1, borderColor: Colors.white, opacity: 0.5 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ padding: 10, color: Colors.white, fontSize: 15 }}>{`${scoredPlayer1}`}</Text>
        </View>
        <View style={{ width: 1, height: 40, backgroundColor: Colors.white, opacity: 0.5 }} />
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text style={{ padding: 10, color: Colors.white, fontSize: 15 }}>{`${scoredPlayer2}`}</Text>
        </View>
      </View>
    </View>
    <View style={{ width: 1, backgroundColor: Colors.white, opacity: 0.5 }} />
  </View>
}

export default ScoreBardCard