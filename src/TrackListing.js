import React, { Component } from 'react';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import './TrackListing.css';

import Track from './Track';

class TrackListing extends Component {
  render() {
    let props = { ...this.props };
    return props.tracks && props.tracks.length > 0 ? (
      <Paper>
        <List>
          {props.tracks.map(track => (
            <ListItem key={track._id} button>
              <Track track={track} />
            </ListItem>
          ))}
        </List>
      </Paper>
    ) : null;
  }
}

export default TrackListing;
