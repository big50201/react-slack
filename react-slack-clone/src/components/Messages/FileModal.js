import React, { Component } from "react";
import { Modal, Icon, Button } from "semantic-ui-react";
import mime from "mime-types";

class FileModal extends Component {
  state = {
    file: null,
    authorized: ["image/png", "image/jpeg"]
  };

  fileInputRef = React.createRef();

  addFile = e => {
    const file = e.target.files[0];
    if (file) {
      this.setState({ file });
    }

    console.log(file);
  };

  sendFile = () => {
    const { file } = this.state;
    const { uploadFile, closeModal } = this.props;
    if (file !== null) {
      if (this.isAuthorized(file.name)) {
        //send file
        const metadata = { contentType: mime.lookup(file.name) };
        uploadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
    }
  };

  isAuthorized = filename =>
    this.state.authorized.includes(mime.lookup(filename));

  clearFile = () => this.setState({ file: null });

  render() {
    const { modal, closeModal } = this.props;
    return (
      <Modal open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Button
            content="Choose File"
            labelPosition="left"
            icon="file"
            onClick={() => this.fileInputRef.current.click()}
          />
          <input
            ref={this.fileInputRef}
            type="file"
            hidden
            onChange={this.addFile}
          />
          {this.state.file && this.state.file.name}
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted onClick={this.sendFile}>
            <Icon name="checkmark" />
            Send
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" />
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
