import icons from '@/assets/icons';
import { Colors } from '@/assets/styles';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export interface Properties {
  newColor?: Boolean;
  id?: String;
  checked?: Boolean;
  onChange?: (value: any) => void;
  label?: String;
}
const Checkbox: React.FC<Properties> = (props: Properties) => {

  const [value, setValue] = React.useState(props.checked);


  const handleClick = () => {
    const newValue = !value;
    setValue(newValue);
    if (props.onChange) props.onChange(newValue);
  }


  return (
    <TouchableOpacity onPress={() => handleClick()}>
      {value === true && <View style={styles.checkboxChecked}>
        <Image source={icons.checked} resizeMode="contain" />
      </View>}
      {value === false && <View style={styles.checkboxUnchecked}></View>}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  checkboxChecked: {
    width: 24, height: 24,
    borderWidth: 1,
    borderColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderWidth: 1,

  }
});
export default Checkbox
