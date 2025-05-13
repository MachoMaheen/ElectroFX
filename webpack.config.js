const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = [
  // Main process
  {
    entry: './src/main/index.ts',
    target: 'electron-main',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js'
    },
    node: {
      __dirname: false,
      __filename: false
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        }
      ]
    }
  },
  
  // Preload
  {
    entry: './src/main/preload.ts',
    target: 'electron-preload',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'preload.js'
    },
    node: {
      __dirname: false,
      __filename: false
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        }
      ]
    }
  },
  
  // Renderer process
  {
    entry: './src/renderer/index.tsx',
    target: 'web',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'renderer.js'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      fallback: {
        "path": require.resolve("path-browserify")
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: /src/,
          use: [{ loader: 'ts-loader' }]
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
            },
            'postcss-loader'
          ]
        }
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'renderer.css'
      })
    ]
  }
];