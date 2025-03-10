
import { uploadUrl } from '@/constants';
import React from 'react';
import { Platform } from 'react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
//import * as ImagePicker from 'react-native-image-crop-picker';
//import { openPicker } from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import { isAndroid } from './Device';
import DocumentPicker, { types } from 'react-native-document-picker'

const options: ImagePicker.ImageLibraryOptions = {
  mediaType: 'video',
  includeBase64: false,
  includeExtra: true,
  //formatAsMp4: true,
}


const getRealPath = (uri: string) => {
  const split = uri.split('/');
  const name = split.pop();
  const inbox = split.pop();
  const realPath = !isAndroid
    ? `${RNFS.TemporaryDirectoryPath}.mp4`
    : uri;
  const decodeUrl = decodeURIComponent(realPath);
  return isAndroid ? uri : '/private/var/mobile/Containers/Data/Application/7E10B8DD-3ABB-45ED-80C9-28B2E0785547.mp4'
}

const pickerVideo = async (callback: any) => {

}

export const VideoPickerResponse = async (callback: (value?: any) => void) => {
  const response: ImagePicker.ImagePickerResponse = await ImagePicker.launchImageLibrary(options)
  if (response) {
    if (response.didCancel) {
      console.log('User cancelled image picker')
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorCode)
      const assets = response?.assets && response?.assets[0]
      callback(assets)
      // if (assets?.uri) {
      //   console.log("assets?.uri", assets?.uri, assets.fileName);
      //   console.log("newPath", getRealPath(assets?.uri));

      //   // const path = (Platform.OS === 'android') ? assets.uri : assets.uri.replace('file://', '')
      //   const path = getRealPath(assets.uri)
      //   console.log("pathsss", path);

      // }
    } else {
      const assets = response?.assets && response?.assets[0]
      callback(assets)
      console.log("paaaa", response);
    }
  }
  // else {
  //   const response = await DocumentPicker.pick({
  //     type: [types.video], copyTo: 'cachesDirectory'
  //   });
  //   const asset = response[0]
  //   console.log("resss", response);

  //   const source = {
  //     uri: asset?.uri.replace('file://', ''),
  //     name: asset?.name,
  //     width: 600,
  //     height: 300
  //   }
  //   callback(source)

  // }

}