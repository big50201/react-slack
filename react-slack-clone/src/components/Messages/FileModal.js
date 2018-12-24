import React, { Component } from 'react';
import {Modal,Input,Icon,Button} from 'semantic-ui-react';
import mime from 'mime-types';

class FileModal extends Component {
    state = {
        file:null,
        authorized:['image/png','image/jpeg']
    }

    addFile = e=>{
        const file = e.target.files[0];
        if(file){
            this.setState({file});
        }
    }

    sendFile = ()=>{
        const {file} = this.state;
        const {uploadFile,closeModal} = this.props;
        if(file!==null){
            if(this.isAuthorized(file.name)){
                //send file
                const metadata = {contentType:mime.lookup(file.name)};
                uploadFile(file,metadata);
                closeModal();
                this.clearFile();
            }
        }
        
    }

    isAuthorized = filename=>this.state.authorized.includes(mime.lookup(filename));

    clearFile = ()=>this.setState({file:null});

    render() {
        const {modal,closeModal} = this.props 
        return (
            <Modal open={modal} onClose={closeModal}>
                <Modal.Header>Select an Image File</Modal.Header>
                <Modal.Content>
                    <Input 
                    fluid
                    label="File types: jpg,png"
                    name="file"
                    type="file"
                    onChange={this.addFile}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color="green"
                        inverted
                        onClick={this.sendFile}
                    >
                        <Icon name="checkmark"/>Send
                    </Button>
                    <Button
                        color="red"
                        inverted
                        onClick={closeModal}
                    >
                        <Icon name="remove"/>Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileModal;