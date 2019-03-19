module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-flow'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-do-expressions'
  ]
};
