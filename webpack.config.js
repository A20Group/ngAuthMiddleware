const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
   entry: './src/ngAuthMiddleware.js',
   output: {
      path: __dirname,
      filename: './dist/ngAuthMiddleware.min.js'
   },

   optimization: {
      minimizer: [
         new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {
               compress: {
                  // inline: false,
                  warnings: false, // Suppress uglification warnings
                  pure_getters: true,
                  //unsafe: true,
                  unsafe_comps: true,
                  sequences: true,
                  dead_code: true,
                  conditionals: true,
                  booleans: true,
                  unused: true,
                  if_return: true,
                  join_vars: true,
                  drop_console: true
               },
               output: {
                  comments: false,
               },
               ie8: true,
               safari10: true,
               exclude: [/\.min\.js$/gi] // skip pre-minified libs
            },
         })
      ],
   },
   resolve: {
      modules: [
         path.resolve('./node_modules'),
      ],
   },
   module: {
      rules: [
         {
            test: /\.js$/,
            exclude: [/node_modules/],
            use: [
               {
                  loader: "ng-annotate-loader",
                  options: { es6: true }
               },
               {
                  loader: "babel-loader",
                  options: {
                     presets: ["es2015", "stage-0"],
                     plugins: [
                        [
                           "transform-runtime",
                           {
                              polyfill: false,
                              regenerator: true
                           }
                        ]
                     ]
                  }
               }
            ]
         },
      ]
   },
   plugins: [
      new webpack.SourceMapDevToolPlugin({
         filename: './dist/ngAuthMiddleware.min.js.map',
      }),
      new CleanWebpackPlugin(['dist'], {
         root: __dirname,
         verbose: true,
         dry: false,
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.LoaderOptionsPlugin({
         minimize: true,
      }),
   ]
}