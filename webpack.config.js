const webpack = require('webpack');
const path = require('path');
const colors = require('colors');

const isDevBuild = process.argv[1].indexOf('webpack-dev-server') !== -1;
const dhisConfigPath =
  process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
let dhisConfig;

try {
  dhisConfig = require(dhisConfigPath);
  console.log('\nLoaded DHIS config:');
} catch (e) {
  // Failed to load config file - use default config
  console.warn('\nWARNING! Failed to load DHIS config:', e.message);
  console.info('Using default config');
  dhisConfig = {
    baseUrl: 'https://hmis.moh.gov.rw/fbf',
    authorization: 'Basic ='
  };
}
console.log(JSON.stringify(dhisConfig, null, 2), '\n');

function log(req, res, opt) {
  req.headers.Authorization = dhisConfig.authorization;
  console.log(
    '[PROXY]'.cyan.bold,
    req.method.green.bold,
    req.url.magenta,
    '=>'.dim,
    opt.target.dim
  );
}

const webpackConfig = {
  context: __dirname,
  entry: './src/app.js',
  devtool: 'source-map',
  output: {
    path: `${__dirname}/build`,
    filename: 'app.js',
    publicPath: 'http://localhost:8081/'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0', 'react']
        }
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'material-ui': path.resolve('./node_modules/material-ui')
    }
  },
  devServer: {
    contentBase: __dirname,
    progress: true,
    port: 8081,
    inline: true,
    compress: true,
    proxy: [
      { path: '/api/*', target: dhisConfig.baseUrl, bypass: log },
      { path: '/dhis-web-commons/*', target: dhisConfig.baseUrl, bypass: log },
      { path: '/icons/*', target: dhisConfig.baseUrl, bypass: log },
      { path: '/css/*', target: 'http://localhost:8081/build', bypass: log },
      {
        path: '/jquery.min.js',
        target: 'http://localhost:8081/node_modules/jquery/dist',
        bypass: log
      },
      {
        path: '/polyfill.min.js',
        target: 'http://localhost:8081/node_modules/babel-polyfill/dist',
        bypass: log
      }
    ]
  }
};

if (!isDevBuild) {
  webpackConfig.plugins = [
    // Replace any occurance of process.env.NODE_ENV with the string 'production'
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      DHIS_CONFIG: JSON.stringify({})
    }),
    new webpack.optimize.UglifyJsPlugin({
      //     compress: {
      //         warnings: false,
      //     },
      comments: false,
      beautify: true
    })
  ];
} else {
  webpackConfig.plugins = [
    new webpack.DefinePlugin({
      DHIS_CONFIG: JSON.stringify(dhisConfig)
    })
  ];
}

module.exports = webpackConfig;
