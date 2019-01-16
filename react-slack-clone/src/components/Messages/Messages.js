import React, { Component } from 'react';
import {Segment,Comment} from 'semantic-ui-react';
import MessageHeader from './MessageHeader';
import MessageForm from './MessageForm';
import firebase from '../../firebase';
import Message from './Message';
import {connect} from 'react-redux';
import {setUserPosts} from '../../actions';
import Typing from './Typing';
import Skeleton from './Skeleton';
import _ from 'lodash';

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
        isChannelStarred:false,
        typeRef:firebase.database().ref('typing'),
        typingUsers:[],
        connectedRef:firebase.database().ref('.info/connected'),
        listeners:[],
    }

    addListener = channelID=>{
        this.addMessageListener(channelID);
        this.addTypingListener(channelID);
    }

    addMessageListener = channelID=>{
        let loadMessages = [];
        const ref = this.getMessageRef();
       
        ref.child(channelID).on('child_added',snap=>{
            loadMessages.push(snap.val());
            this.setState({
                messages:loadMessages,
                messageLoading:false
            });

            this.countUniqueUsers(loadMessages);
            this.countUserPosts(loadMessages);
        });

        //若channel還未有訊息時
        if(channelID !== null && loadMessages.length === 0){
            this.setState({
                messageLoading:false
            });
            
            this.countUserPosts(loadMessages);
        }
    }

    addTypingListener = channelID=>{
        let typingUsers = [];
        this.state.typeRef
        .child(channelID)
        .on("child_added",snap=>{
            if(snap.key !== this.state.user.uid ){
                typingUsers = typingUsers.concat({
                    id:snap.key,
                    name:snap.val()
                })
            }

            this.setState({typingUsers})
        })

        this.addToListeners(channelID,this.state.typeRef,'child_added');
        this.state.typeRef
        .child(channelID)
        .on("child_removed",snap=>{
            const index = typingUsers.findIndex(user=>user.id === snap.key)
            if(index !== -1){
                typingUsers = typingUsers.filter(user=>user.id !== snap.key);
                this.setState({typingUsers})
            }
        })   
        this.addToListeners(channelID,this.state.typeRef,'child_removed');

        this.state.connectedRef.on('value',snap=>{
            if(snap.val()===true){
                this.state.typeRef
                .child(channelID)
                .child(this.state.user.uid)
                .onDisconnect()
                .remove(err=>{
                    if(err!==null){
                        console.error(err)
                    }
                })
            }
        })
    }

    addToListeners = (id,ref,event)=>{
        const index = this.state.listeners.findIndex(listener=>{
            return listener.id === id && listener.ref === ref && listener.event === event
        });

        if(index !== -1){
            const newListeners = {id,ref,event};
            this.setState({listeners:this.state.listeners.concat(newListeners)});
        }
    }

    displayMessage = messages=>{
        return (messages.length>0 && messages.map(message=>{
            let avatar = '';
            this.state.userRef.child(message.user.id).on('value',snap=>(avatar = snap.val().avatar));
            return (
            <Message
                key={message.timestamp}
                message={message}
                avatar = {avatar}
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

    countUserPosts = messages=>{
        let userPosts = messages.reduce((acc,message)=>{
            if(message.user.name in acc){
                acc[message.user.name].count +=1;
                
            }else{
                let avatar = '';
                this.state.userRef.child(message.user.id).on('value',snap=>(avatar = snap.val().avatar));
                acc[message.user.name] = {
                    avatar:avatar,
                    count:1
                }
            }
            return acc;
        },{});
        this.props.setUserPosts(userPosts);
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

    displayTypingUsers = users=>(
        users.length>0 && users.map(user=>(
        <div style={{display:'flex',alignItems:'center',marginBottom:'0.2em'}} key={user.id}>
            <span className="user__typing">{user.name} is typing...</span> <Typing/>
        </div>
        ))
    )

    scrollToBottom = ()=>{
        this.messageEnd.scrollIntoView({behavior:'smooth'});
    }

    displayMessageSkeleton = (loading)=>(
        loading ? 
        (<React.Fragment>
            {[...Array(10)].map((_,i)=>(
                <Skeleton key={i}/>
            ))}
        </React.Fragment>
        ):null

    )

    removeListener = listeners=>{
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event);
        });
    }
    
    componentDidMount(){
        const {channel,user,listeners} = this.state;
        if(channel && user){
            this.removeListener(listeners);
            this.addListener(channel.id);
            this.addUserStarListener(channel.id,user.uid);
        }
    }

    componentDidUpdate(prevProps,prevState){
        if(this.messageEnd){
            this.scrollToBottom();
        }
    }

    componentWillUnmount(){
        this.removeListener(this.state.listeners);
        this.state.connectedRef.off();
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.isPrivateChannel &&
           this.props.currentChannel && this.props.updatedChannel &&
           this.props.currentChannel.id === nextProps.updatedChannel.id){
            this.setState({channel:nextProps.updatedChannel});
        }

    }

    render() {
        const {
            messagesRef,
            messages,
            channel,
            user,
            numUniqueUsers,
            searchTerm,
            searchLoading,
            searchResults,
            privateChannel,
            isChannelStarred,
            typingUsers,
            messageLoading
        } = this.state;
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
                <Segment className={"messages"}>
                    <Comment.Group>
                        {this.displayMessageSkeleton(messageLoading)}
                        {searchTerm ? 
                            this.displayMessage(searchResults):
                            this.displayMessage(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node=>(this.messageEnd = node)}></div>
                        
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

export default connect(null,{setUserPosts})(Messages);