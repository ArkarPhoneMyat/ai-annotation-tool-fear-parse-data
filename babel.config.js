const presets = ['module:metro-react-native-babel-preset'];
const plugins = [];

plugins.push([
  'module-resolver',
  {
    root: ['./src'],
    extensions: ['.js', '.json','.ts','.tsx','.jpg'],
    alias: {
      '@': './src',
    },
  },
]);

plugins.push(['module:react-native-dotenv']);
//plugins.push(['react-native-worklets/plugin'])
plugins.push(['react-native-reanimated/plugin',{globals: ['__process_frame_plugin','__frame_processer_plugin'],},]);

module.exports = {
  presets,
  plugins,
};
