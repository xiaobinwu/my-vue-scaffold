const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const pkgInfo = require('./package.json')
const glob = require('glob')

module.exports = (options = {}) => {
  const config = require('./config/' + (options.config || 'dev'))

  const entries = glob.sync('./src/modules/*.js')
  const entryJsList = {}
  const entryHtmlList = []
  for (const path of entries) {
    const chunkName = path.slice('./src/modules/'.length, -'.js'.length)
    entryJsList[chunkName] = path
    entryHtmlList.push(new HtmlWebpackPlugin({
      template: path.replace('.js', '.html'),
      filename: 'modules/' + chunkName + '.html',
      chunks: ['manifest', 'vendor', chunkName]
    }))
  }

  const webpackObj = {
    entry: Object.assign({
      vendor: ['vue','vuex','vue-router']
    }, entryJsList),

    output: {
      path: resolve(__dirname, 'dist'),
      filename: options.dev ? 'static/js/[name].js' : 'static/js/[name].[chunkhash].js',
      chunkFilename: 'static/js/[id].[chunkhash].js',
      publicPath: config.publicPath
    },

    externals: {

    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
              loaders: {
                sass: options.dev ? 'vue-style-loader!css-loader!sass-loader' : ExtractTextPlugin.extract({
                  use: 'css-loader!sass-loader',
                  fallback: 'vue-style-loader'
                })
              }
          }
        },
        {
            //需要有相应的css-loader，因为第三方库可能会有文件
            //（如：element-ui） css在node_moudle
            test: /\.css$/,
            loader: options.dev ? 'style-loader!css-loader' : ExtractTextPlugin.extract({
                use: "css-loader",
                fallback: 'style-loader'
            })
        },
        {
            test: /\.(scss|sass)$/,
            loader: options.dev ? 'style-loader!css-loader!sass-loader' : ExtractTextPlugin.extract({
                use: "css-loader!sass-loader",
                fallback: 'style-loader'
            })
        },
        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'static/img/[name].[ext]?[hash]'
              }
            }
          ]
        },

        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000
              }
            }
          ]
        }
      ]
    },

    plugins: [
      ...entryHtmlList,

      new ExtractTextPlugin({
          filename: "static/css/[name].[chunkhash].css",
          allChunks: true
      }),

      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),

      new webpack.DefinePlugin({
          'process.env': {
              NODE_ENV: options.dev ? '"development"' : '"production"'
          }
      }),

    ],

    resolve: {
      // require时省略的扩展名，不再需要强制转入一个空字符串，如：require('module') 不需要module.js
      extensions: [".js", ".json", ".vue", ".scss", ".css"],
      //require路径简化
      alias: {
        '~': resolve(__dirname, 'src'),
        //Vue 最早会打包生成三个文件，一个是 runtime only 的文件 vue.common.js，一个是 compiler only 的文件 compiler.js，一个是 runtime + compiler 的文件 vue.js。
        //vue.js = vue.common.js + compiler.js，默认package.json的main是指向vue.common.js，而template 属性的使用一定要用compiler.js，因此需要在alias改变vue指向
        vue: 'vue/dist/vue',
      },
      modules: [
          resolve(__dirname, 'src'),
          'node_modules'
      ]
    },

    devServer: config.devServer ? {
      port: config.devServer.port,
      proxy: config.devServer.proxy,
      publicPath: config.publicPath,
      stats: { colors: true }
    } : undefined,

    performance: {
      hints: options.dev ? false : 'warning'
    },
    devtool: 'inline-source-map'
  }

  if (!options.dev) {
    webpackObj.devtool = false
    webpackObj.plugins = (webpackObj.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
  }

  return webpackObj
}
