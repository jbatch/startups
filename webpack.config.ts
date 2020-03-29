import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const config: webpack.Configuration = {
  context: path.resolve(__dirname),
  entry: './client/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'public'),
    stats: 'errors-only',
    hot: false,
    inline: false,
    port: 8000,
    compress: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ['/socket.io', '/api'],
        target: 'http://localhost:8080',
      },
    ],
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'ts-loader', exclude: '/node_modules/' },
      { test: /game-engine\.js?$/, loader: 'ts-loader', exclude: '/node_modules/' },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: './index.html',
    }),
    new CopyPlugin([{ from: 'public/*.png', to: './[name].[ext]' }]),
  ],
};

export default config;
