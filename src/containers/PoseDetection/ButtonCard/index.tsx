import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  onPress: () => void,
  icon: any,
  style: any,
  tintColor?: string
}
const ButtonCard = ({ onPress, icon, style, tintColor }: Props) => {
  // const tinColor = tintColor ?? null
  return <TouchableOpacity style={style} onPress={onPress}>
    <Image source={icon} style={[styles.icon, { tintColor: tintColor && tintColor }]} resizeMode="contain" />
  </TouchableOpacity>
}

const styles = StyleSheet.create({
  icon: {
    width: 40, height: 40,
  },
})

export default ButtonCard