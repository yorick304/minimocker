const path = require('path')
const os = require("os")
const config = require('../config')
// const utils = require('./utils')
const autoprefixer = require('autoprefixer')
const projectRoot = path.resolve(__dirname, '../')
const px2rem = require('postcss-px2rem')
const HappyPack = require('happypack')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlwebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

let webpackConfig = {
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
    filename: '[name].js'
  },
  resolve: {
      extensions: ['.js', '.vue'],
  },
  module: {
    rules: [{
      test: /\.vue$/,
      use: [{
        loader: 'vue-loader',
        options: {
          loaders: {
            sass: 'style-loader!css-loader!sass-loader'
          },
          postcss: [autoprefixer({browsers: ['> 1%', 'ie >= 9', 'iOS >= 6', 'Android >= 2.1']}), px2rem({remUnit: 75})]
        }
      }]
    }, 
    {
      test: /\.js$/,
      include: projectRoot,
      exclude: [/(node_modules)/, /\.worker\.js/],
      use: 'happypack/loader?id=js'
    }, {
      test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)(\?\S*)?$/,
      use: { 
        loader: `url-loader?limit=1024&name=img/[name]-[hash:8].[ext]`
      }
    }, {
        test: /\.(css|scss|sass)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          test: /[\\/]node_modules[\\/](vue|wdui|core\-js)[\\/]/
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new HappyPack({
      id: 'js',
      threadPool: happyThreadPool,
      loaders: [{
        loader: 'babel-loader',
        options: {
          presets: [ 'es2015' ]
        }
      }]
    }),
    new HappyPack({
      id: 'vuejs',
      threadPool: happyThreadPool,
      loaders: [{
        loader: 'babel-loader',
        options: {
          presets: ["es2015"],
          plugins: ["transform-vue-jsx", "transform-decorators-legacy"]
        } 
      }]
    }),
    new HtmlwebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      chunks: 'index.js',
      chunksSortMode: 'dependency'
    }),
    new webpack.HashedModuleIdsPlugin()
  ]   
};
module.exports = webpackConfig
