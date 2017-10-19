const { resolve } = require('path')
const webpack = require('webpack')
const values = require('object.values')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// 引入骨架屏
const SkeletonWebpackPlugin = require('vue-skeleton-webpack-plugin')
const glob = require('glob')

if (!Object.values) {
	values.shim();
}

module.exports = (options = {}) => {

    // 配置文件，根据 run script不同的config参数来调用不同config
    const config = require('./config/' + (process.env.npm_config_config || options.config || 'dev'))
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
            chunks: ['manifest', 'vendor', chunkName],
            // 允许控制块在添加到页面之前的排序方式
            chunksSortMode: 'dependency'
        }))
    }

    // 处理开发环境和生产环境ExtractTextPlugin的使用情况
    function cssLoaders(loader, opt) {
        const loaders = loader.split('!')
        const opts = opt || {}
        if (options.dev) {
            if (opts.extract) {
                return loader
            } else {
                return loaders
            }
        } else {
            const fallbackLoader = loaders.shift()
            return ExtractTextPlugin.extract({
                use: loaders,
                fallback: fallbackLoader
            })
        }
    }

    const webpackObj = {
        entry: Object.assign({
            vendor: ['vue', 'vuex', 'vue-router']
        }, entryJsList),
        // 文件内容生成哈希值chunkhash，使用hash会更新所有文件
        output: {
            path: resolve(__dirname, 'dist'),
            filename: options.dev ? 'static/js/[name].js' : 'static/js/[name].[chunkhash].js',
            chunkFilename: 'static/js/[id].[chunkhash].js', // 这样异步加载的chunk可以被提取出来，比如（src/router/foo.js）懒加载路由
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
                            sass: cssLoaders('vue-style-loader!css-loader!sass-loader', { extract: true })
                        }
                    }
                },
                {
                    // 需要有相应的css-loader，因为第三方库可能会有文件
                    // （如：element-ui） css在node_moudle
                    // 生产环境才需要code抽离，不然的话，会使热重载失效
                    test: /\.css$/,
                    use: cssLoaders('style-loader!css-loader')
                },
                {
                    test: /\.(scss|sass)$/,
                    use: cssLoaders('style-loader!css-loader!sass-loader')
                },
                {
                    test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 10000,
                                name: 'static/imgs/[name].[ext]?[hash]'
                            }
                        }
                    ]
                }
            ]
            // .concat(options.dev ? [SkeletonWebpackPlugin.loader({
            //     include: Object.keys(entryJsList).map((item) => { return resolve(__dirname, `./src/router/${item}.js`) }),
            //     options: {
            //         entry: Object.keys(entryJsList),
            //         routePathTemplate: '/[name]-skeleton',
            //         insertAfter: 'routes = [',
            //         // 需要改变vue-skeleton-webpack-plugin插件loader.js中importTemplate的插入位置，应该是在source的head位置
            //         importTemplate: 'import [nameCap] from \'~/skeleton/[name]/skeleton.vue\''
            //     }
            // })] : [])
        },

        plugins: [
            ...entryHtmlList,

            // 抽离css
            new ExtractTextPlugin({
                filename: 'static/css/[name].[chunkhash].css',
                allChunks: true
            }),
            // TODO
            // 抽离公共代码
            // 使用manifest可以把待更新的chunk和chunkname从vendor中提取出来，这样保证vendor不会频繁更新（更新的话，chunkname会发生变化，就会重新加载）
            new webpack.optimize.CommonsChunkPlugin({
                names: ['vendor', 'manifest']
            }),
            // 定义全局常量
            // cli命令行使用process.env.NODE_ENV不如期望效果，使用不了，所以需要使用DefinePlugin插件定义，定义形式'"development"'或JSON.stringify('development')
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: options.dev ? JSON.stringify('development') : JSON.stringify('production')
                }
            }),
            // 启用范围提升（webpack3）
            new webpack.optimize.ModuleConcatenationPlugin()
        ],

        resolve: {
            // require时省略的扩展名，不再需要强制转入一个空字符串，如：require('module') 不需要module.js
            extensions: ['.js', '.json', '.vue', '.scss', '.css'],
            // require路径简化
            alias: {
                '~': resolve(__dirname, 'src'),
                // Vue 最早会打包生成三个文件，一个是 runtime only 的文件 vue.common.js，一个是 compiler only 的文件 compiler.js，一个是 runtime + compiler 的文件 vue.js。
                // vue.js = vue.common.js + compiler.js，默认package.json的main是指向vue.common.js，而template 属性的使用一定要用compiler.js，因此需要在alias改变vue指向
                // $ => 为了能够精准匹配vue
                vue$: 'vue/dist/vue'
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
            stats: { colors: true },
            disableHostCheck: true
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
                // webpack2，默认为true，可以不用设置
                compress: {
                    warnings: false
                }
            }),
            //  压缩 loaders
            new webpack.LoaderOptionsPlugin({
                minimize: true
            }),
            // 生成骨架屏
            new SkeletonWebpackPlugin({
                webpackConfig: require('./webpack.skeleton.conf'),
                insertAfter: '<div id="wrap">'
            })
        ])

    }

    return webpackObj
}