import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import MenuItem from 'material-ui/Menu/MenuItem';
import { green, grey } from 'material-ui/colors';

import { jsonToQueryString, getJson, postJson } from './util.js';
import AddProjectFormDialog from './AddProjectFormDialog';

class AddTrackForm extends Component {
  state = {
    showNewProjectModal: false,
    file: '',
    project: '',
    changes: '',
    projects: []
  };

  componentDidMount() {
    this.getProjects();
  }

  addTrack = e => {
    e.preventDefault();
    if (this.state.project === '') {
      alert('A project must be selected.');
    }
    let form = e.target;
    let filename = form['file'].files[0].name;
    let content_type = form['file'].files[0].type;

    getJson(
      `/api/s3credentials?${jsonToQueryString({ filename, content_type })}`
    )
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
          return response.text();
        }
        throw new Error('Network response was not ok.');
      })
      .then(rawXml => {
        let parser = new DOMParser();
        let xml = parser.parseFromString(rawXml, 'text/xml');
        let postResponse = xml.getElementsByTagName('PostResponse');
        let key = postResponse[0].getElementsByTagName('Key')[0].innerHTML;

        const { project, changes } = this.state;
        this.setState({ file: '', changes: '', project: '' });
        return postJson('/api/tracks', {
          projectId: project,
          changes: changes,
          s3key: key
        });
      })
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error(
          'There has been a problem with your fetch operation: ',
          error.message
        );
      });
  };

  getProjects = () => {
    getJson('/api/projects').then(json => {
      this.setState({ projects: json.projects });
    });
  };

  addNewProject = projectName => {
    postJson('/api/projects', { projectName }).then(res => {
      if (res.success) {
        this.setState({ showNewProjectModal: false, project: res.data._id });
        this.getProjects();
      } else {
        alert(res.message);
      }
    });
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  render() {
    console.log(this.state);
    return (
      <div>
        <form onSubmit={this.addTrack}>
          <Grid container alignItems="flex-end" style={gridItemStyle}>
            <Grid item xs>
              <TextField
                id="project"
                label="Choose project"
                required
                select
                fullWidth
                value={this.state.project}
                onChange={this.handleChange('project')}
              >
                {this.state.projects &&
                  this.state.projects.map(option => (
                    <MenuItem key={option._id} value={option._id}>
                      {option.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
            <Grid item>
              <Button
                raised
                onClick={() => this.setState({ showNewProjectModal: true })}
              >
                Add New Project
              </Button>
            </Grid>
          </Grid>
          <br />
          <Grid container alignItems="flex-end" style={gridItemStyle}>
            <Grid item xs>
              <TextField
                id="changes"
                label="Summary of changes"
                required
                fullWidth
                value={this.state.changes}
                onChange={this.handleChange('changes')}
              />
            </Grid>
          </Grid>
          <br />
          <Grid container alignItems="flex-end" style={gridItemStyle}>
            <Grid item xs>
              <TextField
                fullWidth
                onChange={this.handleChange('file')}
                required
                id="file"
                type="file"
                name="file"
                value={this.state.file}
              />
            </Grid>
          </Grid>
          <br />
          <Grid
            container
            alignItems="flex-end"
            justify="flex-end"
            style={gridItemStyle}
          >
            <Grid item>
              <Button>Cancel</Button>
              <Button
                raised
                style={{ background: green[500], color: grey[50] }}
                type="submit"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
        <AddProjectFormDialog
          open={this.state.showNewProjectModal}
          onClose={() => this.setState({ showNewProjectModal: false })}
          onSubmit={this.addNewProject}
        />
      </div>
    );
  }
}

export default AddTrackForm;

const gridItemStyle = {
  height: '68px'
};
