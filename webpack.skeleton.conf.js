/**
 * @file skeleton conf
 * 用于骨架屏生成
 */

const { resolve } = require('path')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const glob = require('glob')
const entryJsList = {}
const entries = glob.sync('./src/skeleton/*/entry-skeleton.js')
for (const path of entries) {
    const chunkName = path.slice('./src/skeleton/'.length, -'/entry-skeleton.js'.length)
    entryJsList[chunkName] = resolve(__dirname, path)
}

console.log(entryJsList)

module.exports = {
    target: 'node',
    devtool: false,
    entry: entryJsList,
    output: {
        path: resolve(__dirname, 'dist'),
        filename: 'static/js/[name].js',
        chunkFilename: 'static/js/[id].[chunkhash].js', 
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.js', '.json', '.vue'],
        alias: {
            '~': resolve(__dirname, 'src'),
            vue$: 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        sass: ExtractTextPlugin.extract({
                            use: 'css-loader!sass-loader',
                            fallback: 'vue-style-loader'
                        })
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    externals: nodeExternals({
        whitelist: /\.css$/
    }),
    plugins: []
}





