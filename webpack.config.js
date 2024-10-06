const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniSccExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');


const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
    },
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
}

const getCssLoaders = (ext = 'css' ) => {
  const loaders = [
    {
      loader: MiniSccExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true,
      },
    },
    'css-loader',
  ];

  if (ext === 'less') loaders.push('less-loader');
  if (ext === 'sass') loaders.push('sass-loader');

  return loaders;
}

const getBabelOptions = (presets = []) => {
  return {
    presets: [
      '@babel/preset-env',
      ...presets,
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
    ],
  }
}

const getJsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: getBabelOptions(),
    },
  ];

  if (isDev) loaders.push('eslint-loader');
  return loaders;
}

getPlugins = () => {
  const plugins = [
    new HtmlWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProd,
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/favicon.ico'),
        to: path.resolve(__dirname, 'dist'),
      },
      {
        from: path.resolve(__dirname, 'src/assets'),
        to: path.resolve(__dirname, 'dist/assets'),
      },
    ]),
    new MiniSccExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ];

  if (isProd) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return plugins;
}


module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: [
      '@babel/polyfill', './index.ts'
    ],
  },
  output: {
    filename: isProd ? '[name].[contenthash].js' : '[name].[hash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimization: optimization(),
  devServer: {
    port: 5100,
    hot: isDev,
    historyApiFallback: true,
  },
  devtool: isDev ? 'source-map' : '',
  plugins: getPlugins(),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: getCssLoaders(),
      },
      {
        test: /\.less$/,
        use: getCssLoaders('less'),
      },
      {
        test: /\.(scss|sass)$/,
        use: getCssLoaders('sass'),
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader'],
      },
      {
        test: /\.xml$/,
        use: ['xml-loader'],
      },
      {
        test: /\.csv$/,
        use: ['csv-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: getJsLoaders(),
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: getBabelOptions(['@babel/preset-typescript']),
        },
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
    ],
  },
}
