import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScreenName } from '@/constants';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainStackParamList, RootStackParamList } from '@/types/stack';
import SplashScreen from '@/containers/Splash';
import PoseDetection from '@/containers/PoseDetection';
import PoseScreen from '@/containers/PoseScreen';
import CameraLive from '@/containers/CameraLive';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainStackParamList>();
const AppStack = () => {

  return (
    <RootStack.Navigator
      screenOptions={
        {
          headerShown: false
        }
      }
    >
      {/* <RootStack.Screen name={ScreenName.SPLASH_SCREEN} component={SplashScreen} /> */}
      <RootStack.Screen name={ScreenName.POSE_SCREEN} component={PoseScreen} />
      <RootStack.Screen name={ScreenName.POSE_DETECTION} component={PoseDetection} />
      <RootStack.Screen name={ScreenName.CAMERA_LIVE} component={CameraLive} />
    </RootStack.Navigator>
  );
};

export default AppStack;