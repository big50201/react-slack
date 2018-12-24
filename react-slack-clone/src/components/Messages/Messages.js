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
        user:this.props.currentUser,
        progressBar:false,
        numUniqueUsers:'',
        searchTerm:'',
        searchLoading:false,
        searchResults:[]
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

            this.countUniqueUsers(loadMessages);
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

    isProgressVisiable = (percent)=>{
        if(percent>0){
            this.setState({
                progressBar:true
            })
        }
    }

    displayChannelName = channel =>channel ? `#${channel.name}`:'';

    countUniqueUsers = messages=>{
        const uniqueUsers = messages.reduce((acc,message)=>{
            if(!acc.includes(message.user.name)){
                acc.push(message.user.name);
            }

            return acc;
        },[]);
        const plural = uniqueUsers.length>1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s":""}`;
        this.setState({numUniqueUsers});
    }

    handleSearchChange = (e)=>{
        this.setState({
            searchTerm:e.target.value,
            searchLoading:true
        },()=>this.handleSearchMessage())
    }

    handleSearchMessage = ()=>{
        const channelMessages = [...this.state.messages];
        const reg = new RegExp(this.state.searchTerm,'gi');
        const searchResults = channelMessages.reduce((acc,message)=>{
            if(message.content &&message.content.match(reg) || 
            message.user.name && message.user.name.match(reg)){
                acc.push(message);
            }

            return acc;
        },[]);
        this.setState({searchResults});
        setTimeout(()=>{this.setState({searchLoading:false})},1000);
    }
    componentDidMount(){
        const {channel,user} = this.state;
        if(channel && user){
            this.addListener(channel.id);
        }
    }

    render() {
        const {messagesRef,messages,channel,user,progressBar,numUniqueUsers,searchTerm,searchLoading,searchResults} = this.state;
        return (
            <React.Fragment>
                <MessageHeader
                    channelName = {this.displayChannelName(channel)}
                    numUniqueUsers = {numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                />
                <Segment>
                    <Comment.Group className={progressBar ? "message__progress":"messages"}>
                        {searchTerm ? 
                            this.displayMessage(searchResults):
                            this.displayMessage(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm 
                messagesRef={messagesRef}
                currentChannel={channel}
                currentUser={user}
                isProgressVisiable={this.isProgressVisiable}/>
            </React.Fragment>
        );
    }
}

export default Messages;