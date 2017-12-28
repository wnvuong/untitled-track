import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

import './App.css';
import { getJson, postJson } from './util.js';

import TrackListing from './TrackListing';
import AddTrackForm from './AddTrackForm';

const theme = createMuiTheme();

class App extends Component {
  state = {
    file: '',
    projects: [],
    project: '',
    newProjectName: '',
    showNewProjectModal: false
  };

  componentDidMount() {
    this.getProjects();
  }

  addTrack = () => {
    postJson('/api/projects', { name: 'name', key: 'key' }).then(json => {
      console.log(json);
    });
  };

  getProjects = () => {
    getJson('/api/projects').then(json => {
      this.setState({ projects: json.projects });
    });
  };

  getBucketItems = () => {
    let tracks = [];
    fetch('http://crtq.s3.amazonaws.com/')
      .then(response => {
        if (response.ok) {
          return response.text();
        }
      })
      .then(rawXml => {
        let parser = new DOMParser();
        let xml = parser.parseFromString(rawXml, 'text/xml');
        let contents = xml.getElementsByTagName('Contents');
        for (var content of contents) {
          let key = content.getElementsByTagName('Key')[0].innerHTML;
          let lastModified = content.getElementsByTagName('LastModified')[0]
            .innerHTML;
          let size = content.getElementsByTagName('Size')[0].innerHTML;
          tracks.push({ key, lastModified, size });
        }
        return tracks;
      })
      .then(tracks => {
        this.setState({ tracks });
      })
      .catch(error => {
        console.error(
          'There has been a problem with your fetch operation: ',
          error.message
        );
      });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
    console.log(name, event.target.value);
  };

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="ut-container">
          <Grid
            container
            justify="space-between"
            alignItems="center"
            style={{ padding: '8px' }}
          >
            <h1>
              <Link to="/">CRTQ</Link>
            </h1>
            <div>
              <Link to="/addtrack">
                <Button raised color="primary">
                  Add Track
                </Button>
              </Link>
            </div>
          </Grid>

          <Route
            exact
            strict
            path="/"
            render={() => (
              <Grid container direction="column" alignItems="stretch">
                <TrackListing projects={this.state.projects} />
              </Grid>
            )}
          />
          <Route
            exact
            strict
            path="/addtrack"
            render={() => (
              <div>
                <AddTrackForm />
              </div>
            )}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
