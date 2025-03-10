import { Platform, Alert, Linking } from 'react-native';
// import {
//   PERMISSIONS, check, RESULTS, request,
// } from 'react-native-permissions';

// const PLATFORM_PERMISSION = {
//   ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
//   android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
// };
// const PLATFORM_PHOTO_PERMISSION = {
//   ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
//   android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
// };

// const REQUEST_PERMISSION_TYPE = {
//   photo: PLATFORM_PERMISSION,
//   photo_white: PLATFORM_PHOTO_PERMISSION,
// };
// export const PERMISSION_TYPE = {
//   photo: 'photo',
//   photo_white: 'photo_white',
// };

// const openSettingModal = () => {
//   Alert.alert(
//     'Notify',
//     'You have not granted permission to access the photo library, Please  update the permissions again',
//     [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Open setting', onPress: () => Linking.openSettings() },
//     ],
//     { cancelable: false },
//   );
// };

// const requestPermission = async (permissions) => {
//   try {
//     const resultPermission = await request(permissions);
//     if (resultPermission === RESULTS.BLOCKED) {
//       return openSettingModal();
//     }
//     return resultPermission === RESULTS.GRANTED;
//   } catch (error) {
//     return false;
//   }
// };

// export const checkPermission = async (type) => {
//   const permissions = REQUEST_PERMISSION_TYPE[type][Platform.OS];
//   if (!permissions) {
//     return true;
//   }
//   try {
//     const result = check(permissions);
//     if (result === RESULTS.GRANTED) {
//       return true;
//     }
//     return requestPermission(permissions);
//   } catch (error) {
//     return false;
//   }
// };

  // const checkAndroidPermission = async () => {
  //   console.log("Platform.Version < 33", Platform.Version);

  //   if (Platform.OS === "android" && Platform.Version < 33) {
  //     const granted = await PermissionsAndroid.requestMultiple([
  //       "android.permission.CAMERA",
  //       "android.permission.WRITE_EXTERNAL_STORAGE"
  //     ]);
  //     if (
  //       granted["android.permission.CAMERA"] !== "granted" ||
  //       granted["android.permission.WRITE_EXTERNAL_STORAGE"] !== "granted"
  //     ) {
  //       throw new Error("Required permission not granted");
  //     } else {
  //       console.log("oke permis");

  //     }
  //   }
  // };


// export const downDownFile = async () => {
//   if (Platform.OS === 'ios') {
//     handleDownloadFile();
//   } else {
//     const permissions = PLATFORM_PHOTO_PERMISSION[Platform.OS];
//     if (!permissions) {
//       return true;
//     }
//   }
// };
