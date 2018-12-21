import React, { Component } from 'react';
import {Menu,Icon,Modal,Form,Input,Button} from 'semantic-ui-react';
class Channels extends Component {
    state = {
        channels:[],
        channelName:'',
        channelDetails:'',
        modal:false
    }
    closeModal = ()=>{
        this.setState({
            modal:false
        });
    }
    handleChange = (e)=>{
        this.setState({[e.target.name]:e.target.value});
    }

    openModal = ()=>{
        this.setState({
            modal:true
        })
    }
    render() {
        const {channels,modal} = this.state;
        return (
            <React.Fragment>
                <Menu.Menu sytle={{paddingBottom:'2em'}}>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange"/> CHANNELS
                        </span>
                        ({channels.length})<Icon name="add" onClick={this.openModal}/>

                    </Menu.Item>
                </Menu.Menu>
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>add Channel</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <Input fluid 
                                label="Name of channel"
                                name="channelName"
                                onChange={this.handleChange}/>
                            </Form.Field>
                            <Form.Field>
                                <Input fluid 
                                    label="About the channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}/>
                            </Form.Field>
                               
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted>
                            <Icon name="checkmark"/>Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"/>Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    }
}

export default Channels;