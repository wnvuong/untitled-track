import React, { Component } from 'react';
import './Track.css';

class Track extends Component {
  render() {
    let props = { ...this.props };

    return <div className="ut-track">{props.track.name}</div>;
  }
}

export default Track;
