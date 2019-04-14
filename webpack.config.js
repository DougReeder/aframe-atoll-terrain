const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'aframe-atoll-terrain.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.glsl$/,
                use: [
                    {loader: 'webpack-glsl-loader'},
                ]
            }
        ]
    }
};
