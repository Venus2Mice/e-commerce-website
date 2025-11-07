const webpack = require('webpack');
const path = require('path');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Fix for react-refresh runtime issue
            webpackConfig.module.rules.push({
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            });

            // Update module resolution
            webpackConfig.resolve = {
                ...webpackConfig.resolve,
                symlinks: false,
                alias: {
                    ...webpackConfig.resolve.alias,
                },
            };

            return webpackConfig;
        },

        // plugins: {
        //     add: [
        //         new webpack.DefinePlugin({
        //             process: { env: {} }
        //         })
        //     ]
        // }
    },
};