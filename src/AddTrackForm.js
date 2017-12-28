import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import MenuItem from 'material-ui/Menu/MenuItem';

import { jsonToQueryString, getJson, postJson } from './util.js';
import AddProjectFormDialog from './AddProjectFormDialog';

class AddTrackForm extends Component {
  state = {
    showNewProjectModal: false,
    project: '',
    projects: []
  };

  componentDidMount() {
    this.getProjects();
  }

  uploadTrack = e => {
    e.preventDefault();
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
    console.log(name, event.target.value);
  };

  render() {
    return (
      <div>
        <form onSubmit={this.uploadTrack}>
          <Grid container alignItems="center">
            <Grid item xs>
              <TextField
                id="project"
                label="Choose project"
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
          {/* <Input
          onChange={this.handleChange("file")}
          style={{ display: "none" }}
          id="file"
          type="file"
          name="file"
          value={this.state.file}
        />
        <label htmlFor="file">
          <Button raised component="span" color="accent">
            {this.state.file !== ""
              ? this.state.file.split("\\").pop()
              : `Add Track`}
          </Button>
        </label>
        {this.state.file !== "" && (
          <Button
            style={{ marginLeft: "5px" }}
            type="submit"
            raised
            color="primary"
            onClick={this.onUploadClick}
          >
            Upload
          </Button>
        )} */}
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
