const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const glob = require('glob')

module.exports = (options = {}) => {
    // 配置文件，根据 run script不同的config参数来调用不同config
    const config = require('./config/' + (process.env.npm_config_config || options.config || 'dev'))
    console.log(config)
    // 遍历入口文件，这里入口文件与模板文件名字保持一致，保证能同时合成HtmlWebpackPlugin数组和入口文件数组
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
    // 处理开发环境和生产环境ExtractTextPlugin的使用情况
    function cssLoaders(loader) {
        if (options.dev) {
            return loader
        } else {
            const loaders = loader.split('!')
            const fallbackLoader = loaders.shift()
            const loadersStr = loaders.join('!')
            return ExtractTextPlugin.extract({
                use: loadersStr,
                fallback: fallbackLoader
            })
        }
    }

    const webpackObj = {
        entry: Object.assign({
            vendor: ['vue', 'vuex', 'vue-router']
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
                // 只 lint 本地 *.vue 文件，需要安装eslint-plugin-html，并配置eslintConfig（package.json）
                {
                    enforce: 'pre',
                    test: /.vue$/,
                    loader: 'eslint-loader',
                    exclude: /node_modules/
                },
                /*
                    http://blog.guowenfh.com/2016/08/07/ESLint-Rules/
                    http://eslint.cn/docs/user-guide/configuring
                    [eslint资料]
                 */
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader', 'eslint-loader']
                },
                // 需要安装vue-template-compiler，不然编译报错
                {
                    test: /\.vue$/,
                    loader: 'vue-loader',
                    options: {
                        loaders: {
                            sass: cssLoaders('vue-style-loader!css-loader!sass-loader')
                        }
                    }
                },
                {
                    // 需要有相应的css-loader，因为第三方库可能会有文件
                    // （如：element-ui） css在node_moudle
                    // 生产环境才需要code抽离，不然的话，会使热重载失效
                    test: /\.css$/,
                    loader: cssLoaders('style-loader!css-loader')
                },
                {
                    test: /\.(scss|sass)$/,
                    loader: cssLoaders('style-loader!css-loader!sass-loader')
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
            // 抽离css
            new ExtractTextPlugin({
                filename: 'static/css/[name].[chunkhash].css',
                allChunks: true
            }),
            // 抽离公共代码
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest']
            }),
            // 定义全局常量
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: options.dev ? '"development"' : '"production"'
                }
            })

        ],

        resolve: {
            // require时省略的扩展名，不再需要强制转入一个空字符串，如：require('module') 不需要module.js
            extensions: ['.js', '.json', '.vue', '.scss', '.css'],
            // require路径简化
            alias: {
                '~': resolve(__dirname, 'src'),
                // Vue 最早会打包生成三个文件，一个是 runtime only 的文件 vue.common.js，一个是 compiler only 的文件 compiler.js，一个是 runtime + compiler 的文件 vue.js。
                // vue.js = vue.common.js + compiler.js，默认package.json的main是指向vue.common.js，而template 属性的使用一定要用compiler.js，因此需要在alias改变vue指向
                vue: 'vue/dist/vue'
            },
            // 指定import从哪个目录开始查找
            modules: [
                resolve(__dirname, 'src'),
                'node_modules'
            ]
        },
        // 开启http服务，publicPath => 需要与Output保持一致 || proxy => 反向代理 || port => 端口号
        devServer: config.devServer ? {
            port: config.devServer.port,
            proxy: config.devServer.proxy,
            publicPath: config.publicPath,
            stats: { colors: true }
        } : undefined,
        // 屏蔽文件超过限制大小的warn
        performance: {
            hints: options.dev ? false : 'warning'
        },
        // 生成devtool，保证在浏览器可以看到源代码，生产环境设为false
        devtool: 'inline-source-map'
    }

    if (!options.dev) {
        webpackObj.devtool = false
        webpackObj.plugins = (webpackObj.plugins || []).concat([
            // 压缩js
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