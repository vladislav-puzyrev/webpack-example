const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all' // Настройка чтобы одна и та же библиотека не дублировалась во всех чанках которые ее используют
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

// Экспортируем объект конфигурации для webpack
module.exports = {
  context: path.resolve(__dirname, 'src'), // Папка с исходным кодом для браузера (чтобы не писать во всех путях ниже ./src/file.js)
  mode: 'development', // Мод сборки dev или prod
  entry: { // Точки входа для сборки
    main: ['@babel/polyfill', './index.tsx'], // Точек входа (чанков) может быть несколько, пропускаем через полифил
    analytics: './analytics.ts' // Сторонний скрипт
  },
  resolve: {
    extensions: ['.js', '.json', '.png'], // Расширения по умолчанию (можно делать import без указания расширения, будет взято из списка)
    alias: { // Псевдонимы для путей при импортах
      '@': path.resolve(__dirname, 'src') // Корень проекта
    }
  },
  output: {
    // В webpack есть "паттерты" например [name] который указывает на ключ чанка из entry
    // [contenthash] решает проблему браузерного кеширования на продакшене когда браузер берет старые закешированные файлы
    filename: filename('js'), // Название собранного js файла (чанка)
    path: path.resolve(__dirname, 'build') // Папка билда
  },
  optimization: optimization(),
  devServer: { // Сервер для разработки (перезагружается при изменениях)
    port: 3000,
    hot: isDev
  },
  devtool: isDev ? 'source-map' : '',
  plugins: [
    new HTMLWebpackPlugin({ // Для подключения скриптов к html странице
      template: './index.html' // Исходный html файл
    }),
    new CleanWebpackPlugin(), // Для очистки папки build перед каждой сборкой
    new CopyWebpackPlugin({ // Для копирования файлов из src в билд (например фавикон)
      patterns: [
        { from: path.resolve(__dirname, 'src/favicon.ico'), to: path.resolve(__dirname, 'build') }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: filename('css')
    })
  ],
  module: {
    rules: [ // Массив правил для разных файлов попадающих под регулярное выражение
      {
        test: /\.css$/,
        // css-loader позволяет вебпаку понимать css импорты
        // style-loader добавляет стили в head в html (tag style)
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // За место style-loader выносит css в отдельный файл
            options: {
              hmr: isDev, // Обновление css без перезагрузки страницы
              reloadAll: true
            }
          },
          'css-loader'
        ] // Лоадеры (вебпак вызывает их справа налево)
      },
      { // Добавление sass
        test: /\.s[ac]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/, // Лоадер для файлов (Они попадают в build)
        use: ['file-loader'] // При импорте берется их путь относительно директории build (Просто название)
        // При этом в css путь надо брать относительно css файла а не папки build
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: ['file-loader']
      },
      { // Babel
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-class-properties'] // Добавляем плагины
            }
          },
          'eslint-loader' // Надо сделать только в dev
        ]
      },
      { // Typescript
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
            plugins: ['@babel/plugin-proposal-class-properties'] // Добавляем плагины
          }
        }
      },
      { // React TSX
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
              plugins: ['@babel/plugin-proposal-class-properties'] // Добавляем плагины
            }
          },
          'eslint-loader' // Надо сделать только в dev
        ]
      },
      { // React JSX
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties'] // Добавляем плагины
          }
        }
      }
    ]
  }
}
