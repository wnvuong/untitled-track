import React, { Component } from 'react';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle
} from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

class AddProjectFormDialog extends Component {
  state = {
    name: ''
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
  };

  render() {
    return (
      <Dialog open={this.props.open} onClose={this.props.onClose}>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent style={{ width: '300px' }}>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="New Project Name"
            onChange={this.handleChange('name')}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              this.props.onSubmit(this.state.name);
            }}
            color="primary"
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AddProjectFormDialog;
