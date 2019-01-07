import React, { Component } from 'react';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../../actions';
import {Menu,Icon} from 'semantic-ui-react';
import firebase from '../../firebase';

class Starred extends Component {
    state = {
        user:this.props.currentUser,
        usersRef:firebase.database().ref('users'),
        // activeChannel:'',
        starredChannels:[]
    }

    displayChannels = (starredChannels)=>
        starredChannels.length>0 && 
        starredChannels.map(channel=>{
                return (
                <Menu.Item
                    key={channel.id}
                    onClick={()=>this.changeChannels(channel)}
                    name={channel.name}
                    style={{opacity:0.7}}
                    active={(channel && channel.id) === (this.props.currentChannel && this.props.currentChannel.id)}
                >
                ＃{channel.name}
                </Menu.Item>)
            });

    // setActiveChannel = channel=>{
    //     this.setState({
    //         activeChannel:channel.id
    //     });
    // }

    changeChannels=(channel)=>{
        // this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
    }

    addListener = uid=>{
        this.state.usersRef
        .child(uid)
        .child('starred')
        .on("child_added",snap=>{
            const starredChannel = {id:snap.key,...snap.val()};
            this.setState({
                starredChannels:[...this.state.starredChannels,starredChannel]
            })
        })

        this.state.usersRef
        .child(uid)
        .child('starred')
        .on('child_removed',snap=>{
            const channelToRemove = {id:snap.key,...snap.val()};
            const filteredChannels = this.state.starredChannels.filter(channel=>{
                return channel.id !==channelToRemove.id;
            });
            this.setState({starredChannels:filteredChannels});
        })
    }

    removeListeners = ()=>{
        this.state.usersRef.child(`${this.state.user.uid}/starred`).off();
    }

    componentDidMount(){
        if(this.state.user){
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.updatedChannel !== null && 
            nextProps.updatedChannel !== this.props.currentChannel){
                let starredChannel = {
                    name:nextProps.updatedChannel.name,
                    details:nextProps.updatedChannel.details,
                    createBy:{
                        name:nextProps.updatedChannel.createBy.name,
                        avatar:nextProps.updatedChannel.createBy.avatar
                    }
                }
                let starredChannels = [];
                if(!this.props.isPrivateChannel){
                    this.state.usersRef
                    .child(this.state.user.uid)
                    .child('starred')
                    .child(nextProps.currentChannel.id)
                    .update(starredChannel)
                    .then(()=>{
                        this.state.usersRef
                        .child(this.state.user.uid)
                        .child('starred')
                        .on("child_added",snap=>{
                            const starredChannel = {id:snap.key,...snap.val()};
                            starredChannels.push(starredChannel);
                            this.setState({starredChannels});
                        })
                    });
                }
                
        }
    }

    
    render() {
        const {starredChannels} = this.state;
        return (
            <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="star"/> STARRED
                        </span>
                        ({starredChannels.length})
                    </Menu.Item>
                    {this.displayChannels(starredChannels)}
                </Menu.Menu>
        );
    }
}

export default connect(null,{setCurrentChannel,setPrivateChannel})(Starred);