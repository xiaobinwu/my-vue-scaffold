/**
 * @file skeleton conf
 * 用于骨架屏生成
 */

const { resolve } = require('path')
const nodeExternals = require('webpack-node-externals')
const glob = require('glob')
const entryJsList = {}
const entries = glob.sync('./src/skeleton/*/entry-skeleton.js')
for (const path of entries) {
    const chunkName = path.slice('./src/skeleton/'.length, -'/entry-skeleton.js'.length)
    entryJsList[chunkName] = path
}

module.exports = {
    target: 'node',
    devtool: false,
    entry: entryJsList,
    output: {
        path: resolve(__dirname, 'dist'),
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[id].[chunkhash].js', // 这样异步加载的chunk可以被提取出来，比如（src/router/foo.js）懒加载路由
        libraryTarget: 'commonjs2'
    },
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
            }
        ]
    },
    externals: nodeExternals({
        whitelist: /\.css$/
    }),
    plugins: []
}





