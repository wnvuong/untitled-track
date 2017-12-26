import React, { Component } from "react";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import Paper from "material-ui/Paper";
import "./TrackListing.css";

import Track from "./Track";

class TrackListing extends Component {
  render() {
    let props = { ...this.props };
    return props.projects && props.projects.length > 0 ? (
      <Paper>
        <List>
          {props.projects.map(project => (
            <ListItem key={project._id} button>
              <Track track={project} />
            </ListItem>
          ))}
        </List>
      </Paper>
    ) : null;
  }
}

export default TrackListing;
