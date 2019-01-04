import React, { Component } from 'react';
import {Menu,Icon,Modal,Form,Input,Button,Label} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel,setPrivateChannel} from '../../actions';
import firebase from 'firebase';
class Channels extends Component {
    state = {
        channels:[],
        channelName:'',
        channelDetails:'',
        channelRef :firebase.database().ref('channels'),
        modal:false,
        user:this.props.currentUser,
        errors:[],
        firstLoad:true,
        // activeChannel:'',
        channel:null,
        messageRef:firebase.database().ref('messages'),
        notifications:[],
        typeRef:firebase.database().ref('typing')
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
    addListeners = ()=>{
        let loadChannels=[];
        this.state.channelRef.on("child_added",snap=>{
            loadChannels.push(snap.val());
            this.setState({channels:loadChannels},()=>this.setFirstChannel());
            this.addNotificationsListener(snap.key);
        });
    }

    addNotificationsListener = channelID=>{
        this.state.messageRef.child(channelID).on('value',snap=>{
            if(this.state.channel){
                this.handleNotifications(
                    channelID,
                    this.state.channel.id,
                    this.state.notifications,
                    snap);
            }
        })
    }

    handleNotifications = (channelID,currentChannelId,notifications,snap)=>{
        let lastTotal = 0;
        let index = notifications.findIndex(notification=>notification.id===channelID);
        if(index!==-1){
            if(channelID!==currentChannelId){
                lastTotal = notifications[index].total;

                if(snap.numChildren()-lastTotal>0){
                    notifications[index].count = snap.numChildren()-lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        }else{
            notifications.push({
                id:channelID,
                total:snap.numChildren(),
                lastKnownTotal:snap.numChildren(),
                count:0
            })
        }

        this.setState({notifications});
    }

    setFirstChannel =()=>{
        const {firstLoad,channels} = this.state;
        const firstChannel = channels[0];
        if(firstLoad && channels.length>0){
            this.props.setCurrentChannel(firstChannel);
            // this.setActiveChannel(firstChannel);
            this.setState({channel:firstChannel});

        }

        this.setState({firstLoad:false})
    }

    displayChannels = (channels)=>
         channels.length>0 && channels.map(channel=>{
            return (
            <Menu.Item
                key={channel.id}
                onClick={()=>this.changeChannels(channel)}
                name={channel.name}
                style={{opacity:0.7}}
                active={(channel && channel.id) === (this.props.currentChannel && this.props.currentChannel.id)}
            >
            {
                this.getNotificationCount(channel) && 
                (<Label color="red">{this.getNotificationCount(channel)}</Label>)
            }
            ＃{channel.name}
            </Menu.Item>)
        });
    
    changeChannels=(channel)=>{
        // this.setActiveChannel(channel);
        this.state.typeRef.child(this.state.channel.id)
               .child(this.state.user.uid)
               .remove();
        this.clearNotifications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({channel});
    }

    // setActiveChannel = channel=>{
    //     this.setState({
    //         activeChannel:channel.id
    //     })
    // }

    clearNotifications = ()=>{
        let index = this.state.notifications
        .findIndex(notification=>notification.id === this.state.channel.id);

        if(index!==-1){
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnownTotal;
            updatedNotifications[index].count = 0;
            this.setState({notifications:updatedNotifications});
        }
    }

    getNotificationCount = channel=>{
        let count = 0;
        this.state.notifications.forEach(notification=>{
            if(notification.id === channel.id){
                count = notification.count;
            }
        })

        if(count>0)return count;
    }

    removeListeners = ()=>{
        this.state.channelRef.off();
        this.state.channels.forEach(channel=>{
            this.state.messageRef.child(channel.id).off();
        })
    }
    componentDidMount(){
        this.addListeners();
    }

    componentWillUnmount(){
        this.removeListeners();
    }

    render() {
        const {channels,modal} = this.state;
        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="exchange"/> CHANNELS
                        </span>
                        ({channels.length})<Icon name="add" onClick={this.openModal}/>
                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>
                <Modal open={modal} onClose={this.closeModal} size="mini">
                    <Modal.Header>add Channel</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <Input 
                                fluid={true} 
                                label="Name of channel"
                                name="channelName"
                                onChange={this.handleChange}/>
                            </Form.Field>
                            <Form.Field>
                                <Input 
                                    fluid={true} 
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

export default connect(null,{setCurrentChannel,setPrivateChannel})(Channels);