module.exports = {
  dependencies: {
    'react-native-video': {
        platforms: {
            android: {
                sourceDir: '../node_modules/react-native-video/android-exoplayer',
            },
        },
    },
    'react-native-flipper': {
      platforms: {
        ios: null,
      },
    },
  },
  project: {
    ios    : {},
    android: {},
  },
  assets: ['./src/assets/fonts','./src/assets/models/blnb230430.tflite','./src/assets/models/blnb230430.txt'],
};
