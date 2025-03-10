import React from "react"
import { Colors } from "@/assets/styles"
import { TouchableOpacity, View } from "react-native"
interface Props {
  backgroundColor?: string,
  backgroundColorInside?: string,
  onPress: () => void
}
const OverWriteButton = ({ backgroundColor = Colors.primaryRed, backgroundColorInside = Colors.white, onPress }: Props) => {
  return <TouchableOpacity onPress={onPress}>
    <View style={{
      width: 40,
      height: 40,
      backgroundColor: backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      marginBottom: 30
    }} >
      <View style={{ width: 30, height: 30, backgroundColor: backgroundColorInside, borderRadius: 15 }} />
    </View>
  </TouchableOpacity>
}

export default OverWriteButton