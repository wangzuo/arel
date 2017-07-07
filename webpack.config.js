const path = require('path');

module.exports = {
  entry: {
    Arel: './src/Arel.js',
    FakeRecord: './src/__fixtures__/FakeRecord'
  },
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: '[name]',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};
