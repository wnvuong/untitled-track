import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Input from 'material-ui/Input';
import './App.css';
import { jsonToQueryString } from './util.js';

import TrackListing from './TrackListing';

const theme = createMuiTheme();

class App extends Component {
  state = {
    file: '',
    tracks: []
  };

  componentDidMount() {
    this.getTracks();
  }

  addTrack = () => {
    fetch('/api/tracks', {
      method: 'POST',
      headers: new Headers({ 'content-type': 'application/json' }),
      body: JSON.stringify({ name: 'name', key: 'key' })
    })
      .then(response => {
        return response.json();
      })
      .then(json => {
        console.log(json);
      });
  };

  getTracks = () => {
    fetch('/api/tracks')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(json => {
        this.setState({ tracks: json.tracks });
      })
      .catch(error => {
        console.error(
          'There has been a problem with your fetch operation: ',
          error.message
        );
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
  };

  uploadTrack = e => {
    e.preventDefault();
    let form = e.target;
    let filename = form['file'].files[0].name;
    let content_type = form['file'].files[0].type;

    fetch(`/api/s3credentials?${jsonToQueryString({ filename, content_type })}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(json => {
        let formData = new FormData();
        for (var key in json.params) {
          if (json.params.hasOwnProperty(key)) {
            formData.set(key, json.params[key]);
          }
        }
        formData.set('file', form['file'].files[0]);
        return fetch('https://crtq.s3.amazonaws.com/', {
          method: 'POST',
          body: formData
        });
      })
      .then(response => {
        if (response.ok) {
          this.setState({ file: '' });
          this.addTrack();
          this.getTracks();
          return;
        }
        throw new Error('Network response was not ok.');
      })
      .catch(error => {
        console.error(
          'There has been a problem with your fetch operation: ',
          error.message
        );
      });
  };

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="ut-container">
          <Grid container justify="space-between" alignItems="center">
            <h1>CRTQ</h1>
            <div>
              <form onSubmit={this.uploadTrack}>
                <Input
                  onChange={this.handleChange('file')}
                  style={{ display: 'none' }}
                  id="file"
                  type="file"
                  name="file"
                  value={this.state.file}
                />
                <label htmlFor="file">
                  <Button raised component="span" color="accent">
                    {this.state.file !== ''
                      ? this.state.file.split('\\').pop()
                      : `Add Track`}
                  </Button>
                </label>
                {this.state.file !== '' && (
                  <Button
                    style={{ marginLeft: '5px' }}
                    type="submit"
                    raised
                    color="primary"
                    onClick={this.onUploadClick}
                  >
                    Upload
                  </Button>
                )}
              </form>
            </div>
          </Grid>
          <Grid container direction="column" alignItems="stretch">
            <TrackListing tracks={this.state.tracks} />
          </Grid>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
