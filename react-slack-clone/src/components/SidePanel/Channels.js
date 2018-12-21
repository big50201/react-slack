import React, { Component } from 'react';
import {Menu,Icon,Modal,Form,Input,Button} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {setCurrentChannel} from '../../actions';
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
        activeChannel:'',
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
            this.setState({channels:loadChannels},()=>this.setFirstChannel())
        })
    }
    setFirstChannel =()=>{
        const {firstLoad,channels} = this.state;
        const firstChannel = channels[0];
        if(firstLoad && channels.length>0){
            this.props.setCurrentChannel(firstChannel)
        }

        this.setState({firstLoad:false})
        this.setActiveChannel(firstChannel)
    }

    displayChannels = (channels)=>
         channels.length>0 && channels.map(channel=>{
            return (
            <Menu.Item
                key={channel.id}
                onClick={()=>this.changeChannels(channel)}
                name={channel.name}
                style={{opacity:0.7}}
                active={channel.id === this.state.activeChannel}
            >
            ＃{channel.name}
            </Menu.Item>)
        });
    
    changeChannels=(channel)=>{
        this.setActiveChannel(channel);
        this.props.setCurrentChannel(channel);
    }

    setActiveChannel = channel=>{
        this.setState({
            activeChannel:channel.id
        })
    }

    removeListeners = ()=>{
        this.state.channelRef.off();
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
                <Menu.Menu sytle={{paddingBottom:'2em'}}>
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

export default connect(null,{setCurrentChannel})(Channels);