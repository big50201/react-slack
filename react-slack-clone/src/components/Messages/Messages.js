import React, { Component } from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessageHeader from './MessageHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';
class Messages extends Component {
    state = {
        privateChannel:this.props.isPrivateChannel,
        messagesRef:firebase.database().ref('messages'),
        privateMessagesRef:firebase.database().ref('privateMessages'),
        messages:[],
        messageLoading:true,
        channel:this.props.currentChannel,
        user:this.props.currentUser,
        userRef:firebase.database().ref('users'),
        progressBar:false,
        numUniqueUsers:'',
        searchTerm:'',
        searchLoading:false,
        searchResults:[],
        isChannelStarred:false
    }

    addListener = channelID=>{
        this.addMessageListener(channelID);
    }

    addMessageListener = channelID=>{
        let loadMessages = [];
        const ref = this.getMessageRef();
        ref.child(channelID).on('child_added',snap=>{
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

    displayChannelName = channel =>{
        return channel ? `${this.state.privateChannel? '@':'#'}${channel.name}`:'';
    }
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
            if(message.content && 
               message.content.match(reg) || 
               message.user.name.match(reg)){
                acc.push(message);
            }

            return acc;
        },[]);
        this.setState({searchResults});
        setTimeout(()=>{this.setState({searchLoading:false})},1000);
    }

    getMessageRef = ()=>{
        const {messagesRef,privateMessagesRef,privateChannel} = this.state;
        return privateChannel ? privateMessagesRef:messagesRef;
    }

    handleStar = ()=>{
        this.setState(preState=>({
            isChannelStarred:!preState.isChannelStarred
        }),()=>this.starChannel());
    }

    starChannel = ()=>{
        if(this.state.isChannelStarred){
            this.state.userRef.child(`${this.state.user.uid}/starred`)
            .update({
                [this.state.channel.id]:{
                    name:this.state.channel.name,
                    details:this.state.channel.details,
                    createBy:{
                        name:this.state.channel.createBy.name,
                        avatar:this.state.channel.createBy.avatar
                    }
                }
            })
        }else{
            this.state.userRef
            .child(`${this.state.user.uid}/starred`)
            .child(this.state.channel.id)
            .remove(err=>{
                if(err !== null){
                    console.error(err);
                }
            })
        }
    }

    addUserStarListener = (channelID,userID)=>{
        this.state.userRef
        .child(userID)
        .child('starred')
        .once('value')
        .then(data=>{
            if(data.val() !== null){
                const channelIDs = Object.keys(data.val());
                const prevStarred = channelIDs.includes(channelID);
                this.setState({isChannelStarred:prevStarred});
            }
        })
    }

    componentDidMount(){
        const {channel,user} = this.state;
        if(channel && user){
            this.addListener(channel.id);
            this.addUserStarListener(channel.id,user.uid);
        }
    }

    render() {
        const {
            messagesRef,
            messages,
            channel,
            user,
            progressBar,
            numUniqueUsers,
            searchTerm,
            searchLoading,
            searchResults,
            privateChannel,
            isChannelStarred} = this.state;
        return (
            <React.Fragment>
                <MessageHeader
                    channelName = {this.displayChannelName(channel)}
                    numUniqueUsers = {numUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivateChannel = {privateChannel}
                    handleStar={this.handleStar}
                    isChannelStarred={isChannelStarred}
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
                isProgressVisiable={this.isProgressVisiable}
                isPrivateChannel={privateChannel}
                getMessageRef={this.getMessageRef}/>
            </React.Fragment>
        );
    }
}

export default Messages;