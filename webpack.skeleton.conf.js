/**
 * @file skeleton conf
 * 用于骨架屏生成
 */

const { resolve } = require('path')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const glob = require('glob')
const entryJsList = {}
const entries = glob.sync('./src/skeleton/**/entry-skeleton.js')
for (const path of entries) {
    const chunkName = path.slice('./src/skeleton/'.length, -'/entry-skeleton.js'.length)
    entryJsList[chunkName] = resolve(__dirname, path)
}

module.exports = {
    target: 'node',
    devtool: false,
    entry: entryJsList,
    output: {
        path: resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.js', '.json', '.vue'],
        alias: {
            '~': resolve(__dirname, 'src'),
            vue$: 'vue/dist/vue'
        }
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /.vue$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader', 'eslint-loader']
            },
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
            }
        ]
    },
    externals: nodeExternals({
        whitelist: /\.css$/
    }),
    plugins: []
}





