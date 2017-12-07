import React, { Component } from 'react';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import './TrackListing.css';

import Track from './Track';

class TrackListing extends Component {
  render() {
    let props = { ...this.props };
    return (
      <Paper>
        <List>
          {props.tracks.map(track => (
            <ListItem button>
              <Track key={track.id} track={track} />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  }
}

export default TrackListing;
