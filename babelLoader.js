module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components|helpers)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                debug: false,
                                modules: false,
                                targets: {
                                    browsers: ['> 1%']
                                },
                                useBuiltIns: 'usage'
                            }]
                        ],
                        babelrc: false
                    }
                }
            }
        ]
    }
}
