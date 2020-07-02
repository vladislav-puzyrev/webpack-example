import React from 'react'
import ReactDOM from 'react-dom'
import jquery from 'jquery'
// @ts-ignore
import Post from '@/Post' // Корень проекта (src)
import './styles/styles.css' // Подключение css
// @ts-ignore
import json from './assets/json.json'
// @ts-ignore
import image from './assets/webpack-logo'
import './styles/scss.scss'

const App = () => (
  <>
    <h1>Webpack</h1>
    <div className="container">
      <h2>Course</h2>
      <hr/>
      <div className="logo"/>
      <hr/>
      <pre/>
      <hr/>
      <div className="card">
        <h2>Sass</h2>
      </div>
    </div>
  </>
)

ReactDOM.render(<App/>, document.getElementById('root'))

const post = new Post('Webpack post title', image)
console.log(post.toString())
console.log(json)
jquery('pre').html(post.toString())
