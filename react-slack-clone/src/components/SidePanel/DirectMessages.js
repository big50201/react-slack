import React, { Component } from 'react';
import {Menu,Icon} from 'semantic-ui-react';
import firebase from 'firebase';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../../actions';
class DirectMessages extends Component {
    state = {
        user:this.props.currentUser,
        users:[],
        userRef:firebase.database().ref('users'),
        connectedRef:firebase.database().ref('.info/connected'),
        presenceRef:firebase.database().ref('presence'),
    }

    addListeners = currentUserUid=>{
        let loadUsers = [];
        this.state.userRef.on('child_added',snap=>{
            if(currentUserUid !== snap.key){
                let user = snap.val();
                user["uid"] = snap.key;
                user["status"] = "offline";
                loadUsers.push(user);
                this.setState({users:loadUsers})
            }
        });

        this.state.connectedRef.on('value',snap=>{
            if(snap.val() === true){
                const ref = this.state.presenceRef.child(currentUserUid);
                ref.set(true);
                ref.onDisconnect().remove(err=>{
                    if(err!==null){
                        console.error(err);
                    }
                });
            }
        });

        this.state.presenceRef.on('child_added',snap=>{
          if(currentUserUid !== snap.key){
              this.addStatusToUser(snap.key);
          }  
        })

        this.state.presenceRef.on('child_removed',snap=>{
            if(currentUserUid !== snap.key){
                this.addStatusToUser(snap.key,false);
            }  
          })

    }

    removeListeners = ()=>{
        this.state.userRef.off();
        this.state.presenceRef.off();
        this.state.connectedRef.off();
    }

    addStatusToUser = (userID,connected = true)=>{
        const upadtedUser = this.state.users.reduce((acc,user)=>{
            if(user.uid === userID){
                user["status"] = `${connected ? 'online':'offline'}`;
            }

            return acc.concat(user);
        },[]);

        this.setState({users:upadtedUser})
    }

    isUserOnline = user=>user.status === "online";

    changeChannel = user=>{
        const channelID = this.getChannelID(user.uid);
        const channelData = {
            id:channelID,
            name:user.name
        };
        this.props.setCurrentChannel(channelData);
        this.props.setPrivateChannel(true);
    }

    getChannelID = uid=>{
        const userID = this.state.user.uid;
        return userID < uid ? 
        `${uid}/${userID}`:
        `${userID}/${uid}`;
    }

    componentDidMount(){
        if(this.state.user){
            this.addListeners(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    render() {
        const {users} = this.state;
        return (
            <Menu.Menu className="menu">
                <Menu.Item>
                    <span>
                        <Icon name="mail"/>DIRECT MESSAGES
                    </span>{''}
                    ({users.length})
                </Menu.Item>
                {users.map((user)=>(
                <Menu.Item
                    key={user.uid}
                    onClick={()=>{this.changeChannel(user)}}
                    style={{opacity:0.7,fontStyle:'italic'}}
                    active={user.name === (this.props.currentChannel && this.props.currentChannel.name)}
                >
                    <Icon 
                    name="circle"
                    color={this.isUserOnline(user) ? 'green':'red'}/>
                    @{user.name}
                </Menu.Item>))}
            </Menu.Menu>
        );
    }
}


export default connect(null,{setCurrentChannel,setPrivateChannel})(DirectMessages);