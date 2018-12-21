import React, { Component } from 'react';
import {Menu,Icon,Modal,Form,Input,Button} from 'semantic-ui-react';
import firebase from 'firebase';
class Channels extends Component {
    state = {
        channels:[],
        channelName:'',
        channelDetails:'',
        channelRef :firebase.database().ref('channels'),
        modal:false,
        user:this.props.currentUser,
        errors:[]
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

    handleSubmit = e=>{
        e.preventDefault();
        if(this.isFormValid(this.state)){
            this.addChannel();
            console.log('channel added');
        }
    }
    isFormValid = ({channelName,channelDetails})=>channelName && channelDetails;

    addChannel = ()=>{
        const {channelRef,channelName,channelDetails,user} = this.state;
        const key = channelRef.push().key;
        const newChannel = {
            id:key,
            name:channelName,
            details:channelDetails,
            createBy:{
                name:user.displayName,
                avatar:user.photoURL
            }
        };
        channelRef
        .child(key)
        .update(newChannel)
        .then(()=>{
            this.setState({channelName:'',channelDetails:''});
            this.closeModal();
        })
        .catch((err)=>{
            console.log(err);
            this.setState({errors:this.state.errors.concat(err)});
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
                <Modal open={modal} onClose={this.closeModal} size="mini">
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
                        <Button color="green" inverted onClick={this.handleSubmit}>
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