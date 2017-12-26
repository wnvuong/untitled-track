import React, { Component } from "react";
import { Link, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "material-ui/styles";
import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import Input from "material-ui/Input";
import MenuItem from "material-ui/Menu/MenuItem";
import TextField from "material-ui/TextField";
import Dialog, { DialogTitle } from "material-ui/Dialog";
import "./App.css";
import { jsonToQueryString, getJson, postJson } from "./util.js";

import TrackListing from "./TrackListing";

const theme = createMuiTheme();

class App extends Component {
  state = {
    file: "",
    projects: [],
    project: null,
    newProjectName: null,
    showNewProjectModal: false
  };

  componentDidMount() {
    this.getProjects();
  }

  addTrack = () => {
    postJson("/api/projects", { name: "name", key: "key" }).then(json => {
      console.log(json);
    });
  };

  getProjects = () => {
    getJson("/api/projects").then(json => {
      this.setState({ projects: json.projects });
    });
  };

  addNewProject = projectName => {
    postJson("/api/projects", { projectName }).then(res => console.log(res));
  };

  getBucketItems = () => {
    let tracks = [];
    fetch("http://crtq.s3.amazonaws.com/")
      .then(response => {
        if (response.ok) {
          return response.text();
        }
      })
      .then(rawXml => {
        let parser = new DOMParser();
        let xml = parser.parseFromString(rawXml, "text/xml");
        let contents = xml.getElementsByTagName("Contents");
        for (var content of contents) {
          let key = content.getElementsByTagName("Key")[0].innerHTML;
          let lastModified = content.getElementsByTagName("LastModified")[0]
            .innerHTML;
          let size = content.getElementsByTagName("Size")[0].innerHTML;
          tracks.push({ key, lastModified, size });
        }
        return tracks;
      })
      .then(tracks => {
        this.setState({ tracks });
      })
      .catch(error => {
        console.error(
          "There has been a problem with your fetch operation: ",
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

  uploadTrack = e => {
    e.preventDefault();
    let form = e.target;
    let filename = form["file"].files[0].name;
    let content_type = form["file"].files[0].type;

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
        formData.set("file", form["file"].files[0]);
        return fetch("https://crtq.s3.amazonaws.com/", {
          method: "POST",
          body: formData
        });
      })
      .then(response => {
        if (response.ok) {
          this.setState({ file: "" });
          this.addTrack();
          this.getTracks();
          return;
        }
        throw new Error("Network response was not ok.");
      })
      .catch(error => {
        console.error(
          "There has been a problem with your fetch operation: ",
          error.message
        );
      });
  };

  handleNewProjectModalClose = value => {
    this.setState({ showNewProjectModal: false });
  };

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div className="ut-container">
          <Grid container justify="space-between" alignItems="center">
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
                <form
                  onSubmit={this.uploadTrack}
                  style={{ margin: "20px -8px" }}
                >
                  <Grid container alignItems="flex-end">
                    <Grid item xs>
                      <TextField
                        id="project"
                        label="Choose project"
                        select
                        fullWidth
                        value={this.state.project}
                        onChange={this.handleChange("project")}
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
                        onClick={() =>
                          this.setState({ showNewProjectModal: true })
                        }
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
              </div>
            )}
          />
          <Dialog
            open={this.state.showNewProjectModal}
            onClose={this.handleNewProjectModalClose}
          >
            <DialogTitle>Name new project</DialogTitle>
            <Button onClick={this.handleNewProjectModalClose}>Submit</Button>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
