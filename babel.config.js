module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@components': './src/components',
            '@screens':    './src/screens',
            '@contexts':   './src/contexts',
            '@services':   './src/services',
            '@utils':      './src/utils',
            '@types':      './src/types',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
