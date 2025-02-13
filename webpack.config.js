const path = require('path');
const webpack = require('webpack')

module.exports = {
	mode: process.env.NODE_ENV || 'development',
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'framework.js',
		library: 'CustomFramework',
		libraryTarget: 'umd',
		globalObject: 'this'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx'],
		alias: {
			'@core': path.resolve(__dirname, 'src/core'),
			'@compiler': path.resolve(__dirname, 'src/compiler'),
			'@utils': path.resolve(__dirname, 'src/utils'),
		}
	},
	devServer: {
		contentBase: path.join(__dirname, 'examples'),
		hot: true,
		port: 3000
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
}