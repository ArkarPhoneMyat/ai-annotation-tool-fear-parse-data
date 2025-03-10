import React, { useEffect, useState } from 'react';
import { Button, Text } from "@/components"
import { StyleSheet, TextInput, View, useWindowDimensions, Alert, StatusBar } from "react-native"
import Orientation from 'react-native-orientation-locker';
import { PoseScreenProps } from '@/types/navigation';
import { ScreenName } from '@/constants';
import Checkbox from '@/components/CheckBox';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { Model } from '@/utils/Device';


const PoseScreen = ({ navigation }: PoseScreenProps) => {
  const [namePlayer1, setNamePlayer1] = useState('g')
  const [namePlayer2, setNamePlayer2] = useState('h')
  const [poseThreshold, setPoseThreshold] = useState('0.8')
  const [objThreshold, setObjThreshold] = useState('0.3')
  const [debug, setDebug] = useState(false)
  const [manual, setManual] = useState(false)
  const [camera, setCamera] = useState(false)


  useEffect(() => {
    // Orientation.lockToLandscape()
    SystemNavigationBar.navigationShow()
  }, [])

  const onNavigateStart = () => {
    if (!namePlayer1 || !namePlayer2) {
      Alert.alert('Error', 'Please enter name')
      return;
    }
    if (camera) {
      navigation.navigate(ScreenName.CAMERA_LIVE)
    } else {
      navigation.navigate(ScreenName.POSE_DETECTION, {
        namePlayer1,
        namePlayer2,
        debug,
        poseThreshold: Number(poseThreshold),
        objThreshold: Number(objThreshold),
        manual,
        camera,
      })
    }

  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* <StatusBar backgroundColor={'red'} barStyle={'light-content'} hidden showHideTransition={'none'} /> */}
      <Text style={{ fontSize: 20 }}>Annotation Mode</Text>
      <View style={styles.row}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 40 }}>
          <Text style={styles.title}>Pose Threshold:</Text>
          <TextInput
            value={poseThreshold}
            onChangeText={(value) => setPoseThreshold(value)}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.title}>Object Threshold:</Text>
          <TextInput
            value={objThreshold}
            onChangeText={(value) => setObjThreshold(value)}
          />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 40 }}>
          <Text style={styles.title}>Name1: </Text>
          <TextInput
            value={namePlayer1}
            onChangeText={(value) => setNamePlayer1(value)}
            placeholder='Enter name'
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.title}>Name2: </Text>
          <TextInput
            value={namePlayer2}
            onChangeText={(value) => setNamePlayer2(value)}
            placeholder='Enter name' />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <View style={styles.row}>
          <Checkbox
            checked={false}
            onChange={value => {
              setManual(value)
            }}
          />
          <Text style={{ marginLeft: 4, fontWeight: 'bold' }}>Manual</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
          <Checkbox
            checked={false}
            onChange={value => {
              setDebug(value)
            }} //handle new value
          />
          <Text style={{ marginLeft: 4, fontWeight: 'bold' }}>Debug</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
          <Checkbox
            checked={false}
            onChange={value => {
              setCamera(value)
            }} //handle new value
          />
          <Text style={{ marginLeft: 4, fontWeight: 'bold' }}>Live Camera</Text>
        </View>
      </View>
      <Button name='Start' handleClick={onNavigateStart} style={{ paddingVertical: 10, marginLeft: 20 }} />
    </View >
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: {
    fontSize: 15,
  }
});

export default PoseScreen