import React, { Component } from 'react'
import Video from './Video'
import VideoExample from './VideoExample'
import Home from './Home'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

class App extends Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/:url' component={VideoExample} />
          </Switch>
        </Router>
      </div>
    )
  }
}

export default App
