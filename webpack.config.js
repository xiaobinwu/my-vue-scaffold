const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pkgInfo = require('./package.json')
const glob = require('glob')

module.exports = (options = {}) => {
  const config = require('./config/' + (process.env.npm_config_config || options.config || 'default'))

  const entries = glob.sync('./src/**/index.js')
  const entryJsList = {}
  const entryHtmlList = []
  for (const path of entries) {
    const chunkName = path.slice('./src/pages/'.length, -'/index.js'.length)
    entryJsList[chunkName] = path
    entryHtmlList.push(new HtmlWebpackPlugin({
      template: path.replace('index.js', 'index.html'),
      filename: chunkName + '.html',
      chunks: ['manifest', 'vendor', chunkName]
    }))
  }

  return {
    entry: Object.assign({
      vendor: './src/vendor'
    }, entryJsList),

    output: {
      path: resolve(__dirname, 'dist'),
      filename: options.dev ? '[name].js' : '[name].js?[chunkhash]',
      chunkFilename: '[id].js?[chunkhash]'
    },

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'eslint-loader']
        },

        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                root: resolve(__dirname, 'src'),
                attrs: ['img:src', 'link:href']
              }
            }
          ]
        },

        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },

        {
          test: /favicon\.png$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]?[hash]'
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

      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),

      new webpack.DefinePlugin({
        DEBUG: Boolean(options.dev),
        VERSION: JSON.stringify(pkgInfo.version),
        CONFIG: JSON.stringify(config.runtimeConfig)
      })
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
      }
    },

    devServer: config.devServer ? {
      host: '0.0.0.0',
      port: config.devServer.port,
      proxy: config.devServer.proxy
    } : undefined,

    performance: {
      hints: options.dev ? false : 'warning'
    }
  }
}
