const path = require('path');

module.exports = {
  entry: './src/Arel.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'Arel.js',
    library: 'Arel',
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
