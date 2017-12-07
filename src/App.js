import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import './App.css';

import TrackListing from './TrackListing';

const theme = createMuiTheme();
const tracks = [
  {
    id: 1,
    name: 'The Less I Know The Better'
  },
  {
    id: 2,
    name: 'Let It Happen'
  }
];

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="ut-container">
          <Grid container justify="space-between" alignItems="center">
            <h1>Untitled Track</h1>
            <Button raised color="primary">
              Upload
            </Button>
          </Grid>
          <Grid container direction="column" alignItems="stretch">
            <TrackListing tracks={tracks} />
          </Grid>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
