module.exports = {
    publicPath: '/dist/',
    devServer: {
        port: 8100,
        proxy: {
            // '/api/auth/': {
            //     target: 'http://api.example.dev',
            //     changeOrigin: true,
            //     pathRewrite: { '^/api': '' }
            // }
        }
    }
}