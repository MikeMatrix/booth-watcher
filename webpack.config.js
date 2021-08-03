const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    library: {
      type: 'commonjs-module'
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.ts']
  },
  performance: {
    hints: false
  },
  devtool: false, // 'inline-source-map'
  target: 'node',
  externals: ['dotenv', 'cheerio', 'axios'],
  stats: {
    preset: 'errors-only',
    builtAt: true,
    timings: true
  },
  plugins: [],
  optimization: {
    // minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false
      })
    ]
  }
};
