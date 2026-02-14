const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WWPlugin = require('./ww_plugin.js')
const webpack = require('webpack')
const path = require('path')

global.port = '8080'

module.exports = {
    entry: './test/index.js',
    resolve: {
        alias: {
        '@src': path.resolve(__dirname, '..', 'src'),
        '@components': path.resolve(__dirname, '..', 'src', 'components'),
        '@component-js': path.resolve(__dirname, '..', 'src', 'components', 'js'),
        '@composables': path.resolve(__dirname, '..', 'src', 'composables'),
        '@helpers': path.resolve(__dirname, '..', 'src', 'helpers'),
        '@icons': path.resolve(__dirname, '..', 'src', 'icons'),
        '@overlay-comps': path.resolve(__dirname, '..', 'src', 'components', 'overlays'),
        '@stuff': path.resolve(__dirname, '..', 'src', 'stuff'),
        '@tests': path.resolve(__dirname, '..', 'test', 'tests'),
        },
    },
    module: {
        rules: [{
                test: /\.ts$/, // Regex to test for .ts files
                use: 'ts-loader', // Use ts-loader for these files
                exclude: /node_modules/, // Exclude node_modules directory
            },
            {
                test: /\.vue$/,
                exclude: /node_modules/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
            {
                test: /script_ww\.js$/,
                loader: 'worker-loader'
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: './test/index.html'
        }),
        new WWPlugin(),
        new webpack.DefinePlugin({
            MOB_DEBUG: JSON.stringify(process.env.MOB_DEBUG)
        })
    ],
    devServer: {
        contentBase: [path.join(__dirname, '../data'), path.join(__dirname, '../assets')], // served at root i.e. locahost/data.json
        host: '0.0.0.0',
        proxy: {
            '/api/v1/**': {
                target: 'https://api.binance.com',
                changeOrigin: true
            },
            '/ws/**': {
                target: 'wss://stream.binance.com:9443',
                changeOrigin: true,
                ws: true
            },
            '/api/udf/**': {
                target: 'https://www.bitmex.com',
                changeOrigin: true
            },
        },
        onListening: function(server) {
            const port = server.listeningApp.address().port
            global.port = port
        },
        before(app){
            app.get("/debug", function(req, res) {
                try {
                    let argv = JSON.parse(req.query.argv)
                    console.log(...argv)
                } catch(e) {}
                res.send("[OK]")
            })
        }
    },
    devtool: 'source-map'
}
