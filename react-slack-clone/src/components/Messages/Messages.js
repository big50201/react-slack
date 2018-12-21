import React, { Component } from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessageHeader from './MessageHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';
class Messages extends Component {
    state = {
        messagesRef:firebase.database().ref('messages'),
        messages:[],
        messageLoading:true,
        channel:this.props.currentChannel,
        user:this.props.currentUser

    }

    addListener = channelID=>{
        this.addMessageListener(channelID);
    }

    addMessageListener = channelID=>{
        let loadMessages = [];
        this.state.messagesRef.child(channelID).on('child_added',snap=>{
            loadMessages.push(snap.val());
            this.setState({
                messages:loadMessages,
                messageLoading:false
            })
        });
    }

    displayMessage = messages=>{
        return (messages.length>0 && messages.map(message=>{
            return (
            <Message
                key={message.timestamp}
                message={message}
                user={this.state.user}
            />)
        }))
    }
    componentDidMount(){
        const {channel,user} = this.state;
        if(channel && user){
            this.addListener(channel.id);
        }
    }

    render() {
        const {messagesRef,messages,channel,user} = this.state;
        return (
            <React.Fragment>
                <MessageHeader/>
                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessage(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm 
                messagesRef={messagesRef}
                currentChannel={channel}
                currentUser={user}/>
            </React.Fragment>
        );
    }
}

export default Messages;