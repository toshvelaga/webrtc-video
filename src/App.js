import React, { Component } from 'react'
import Video from './Video'
import VideoPreview from './VideoPreview'
import Home from './Home'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/video-preview' exact component={VideoPreview} />
            <Route path='/:url' component={Video} />
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
