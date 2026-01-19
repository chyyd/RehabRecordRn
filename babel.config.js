module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/navigation': './src/navigation',
          '@/stores': './src/stores',
          '@/services': './src/services',
          '@/hooks': './src/hooks',
          '@/utils': './src/utils',
          '@/types': './src/types',
          '@/assets': './src/assets',
        },
      },
    ],
    // 暂时注释掉react-native-dotenv以支持测试环境
    // 需要安装: npm install --save-dev react-native-dotenv
    // [
    //   'module:react-native-dotenv',
    //   {
    //     moduleName: '@env',
    //     path: '.env',
    //     safe: false,
    //     allowUndefined: true,
    //   },
    // ],
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
};
