import React, { Component } from 'react';
import {Segment,Button,Input} from 'semantic-ui-react';
import firebase from '../../firebase';

class MessageForm extends Component {
    state = {
        message:'',
        channel:this.props.currentChannel,
        isLoading:false,
        user:this.props.currentUser,
        errors:[]
    }

    handleChange = e=>{
        this.setState({[e.target.name]:e.target.value});
    }

    sendMessage = ()=>{
        const {messagesRef} = this.props;
        const {message,channel} = this.state;
        if(message){
            messagesRef
            .child(channel.id)
            .push()
            .set(this.createMessage())
            .then(()=>{
                this.setState({
                    isLoading:false,
                    message:'',
                    errors:[]
                })
            })
            .catch((err)=>{
                console.log(err);
                this.setState({errors:this.state.errors.concat(err),isLoading:false})
            })
            this.setState({isLoading:true});
        }else{
            this.setState({
                errors:this.state.errors.concat({message:'add a message'})
            })
        }
    }

    createMessage = ()=>{
        const {user} = this.state
        const message = {
            content:this.state.message,
            timestamp:firebase.database.ServerValue.TIMESTAMP,
            user:{
                id:user.uid,
                name:user.displayName,
                avatar:user.photoURL
            }
        }
        return message;
    }
    render() {
        const {errors} = this.state;
        return (
            <Segment className="message__form">
                <Input
                    fluid
                    name="message"
                    style={{marginBottom:'0.7em'}}
                    label={<Button icon="add"/>}
                    labelPosition="left"
                    placeholder="Write your message"
                    onChange={this.handleChange}
                    className={errors.some(err=>err.message.includes('message')) ? 'error':''}
                />
                <Button.Group icon widths="2">
                    <Button
                        color="yellow"
                        content="Add Apply"
                        labelPosition="left"
                        icon="edit"
                        onClick={this.sendMessage}
                    />
                    <Button
                        color="teal"
                        content="Upload Media"
                        labelPosition="left"
                        icon="upload"
                    />
                </Button.Group>
            </Segment>
        );
    }
}

export default MessageForm;