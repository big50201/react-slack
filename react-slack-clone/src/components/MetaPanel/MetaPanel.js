import React, { Component } from 'react';
import {Segment,Accordion,Header,Icon,Image,List,Modal,Form,Input,Button} from 'semantic-ui-react';
import firebase from '../../firebase';
import {connect} from 'react-redux';
import {updatedCurrentChannel,getAllChannels,getAllStarredChannels} from '../../actions';
import _ from 'lodash';
class MetaPanel extends Component {
    state = {
        activeIndex:0,
        privateChannel:this.props.isPrivateChannel,
        channel:this.props.currentChannel,
        modal:false,
        usersRef:firebase.database().ref('users'),
        channelRef :firebase.database().ref('channels'),
        errors:[],
        channelName:this.props.currentChannel && this.props.currentChannel.name,
        channelDetails:this.props.currentChannel && this.props.currentChannel.details,
        updatedChannel:this.props.updatedChannel,
        createAvatar:'',
        isUpdatedChannel:false,
        isUpdatedStarredChannel:false
    }

    setActiveIndex = (e,titileProps)=>{
        const {index} = titileProps;
        const {activeIndex} = this.state;
        const newIndex = activeIndex === index ? -1:index;
        this.setState({activeIndex:newIndex});
    }

    displayTopPosters = posts=>{
        return (Object
        .entries(posts)
        .sort((a,b)=>b[1]-a[1])
        .map(([key,val],index)=>(
            <List.Item key={index}>
                <Image avatar src={val.avatar}/>
                <List.Content>
                    <List.Header as="a">{key}</List.Header>
                    <List.Description>{this.formatCount(val.count)}</List.Description>
                </List.Content>
            </List.Item>
        ))
        .slice(0,5));
    }

    formatCount = count=> count >1 || count === 0 ? `${count} posts`:`${count} post`;

    openModal = ()=>this.setState({modal:true});    
    closeModal = ()=>this.setState({modal:false});
    
    handleChange = (e)=>{
        this.setState({[e.target.name]:e.target.value});
    }

    handleEditChannel = e=>{
        e.preventDefault();
        if(this.isFormValid(this.state)){
            this.editChannel();
            console.log('channel updated');
        }
    }

    isFormValid = ({channelName,channelDetails})=>channelName && channelDetails;

    editChannel =()=>{
        let updatedChannel = {
            id:this.props.currentChannel.id,
            name:this.state.channelName,
            details:this.state.channelDetails,
            createBy:{
                name:this.props.currentChannel.createBy.name,
                avatar:this.props.currentChannel.createBy.avatar
            }
        }
        this.state.channelRef
        .child(updatedChannel.id)
        .update(updatedChannel)
        .then(()=>{
            this.props.updatedCurrentChannel(updatedChannel);
            this.setState({
                channel:updatedChannel,
                channelName:updatedChannel.name,
                channelDetails:updatedChannel.details,
                updatedChannel:updatedChannel
            });
            let starred = {};
            let userIDs = [];
            this.state.usersRef.on('child_added',snap=>{
                if(snap.child('starred').val()!==null){
                    starred = snap.child('starred').val();
                    if(this.state.channel.id in starred){
                        userIDs.push(snap.key);
                    }
                }
            })
            if(userIDs.length>0){
                userIDs.forEach(item=>{
                    this.state.usersRef.child(`${item}/starred`).update({
                        [this.state.channel.id]:{
                            name:this.state.channel.name,
                            details:this.state.channel.details,
                            createBy:{
                                name:this.state.channel.createBy.name,
                                avatar:this.state.channel.createBy.avatar
                            }
                        }
                    }).then(()=>{
                        console.log('starred updated')
                    }).catch(err=>{
                        console.log(err);
                    })
                })
            }
            this.closeModal();
            
        })
        .catch((err)=>{
            console.log(err);
            this.setState({errors:this.state.errors.concat(err)});
        })
    }

    getAllChannels = (isUpdatedChannel)=>{
        let channels=[];
        if(isUpdatedChannel){
            this.state.channelRef.on('child_added',snap=>{
                channels.push(snap.val());
            });
            this.props.getAllChannels(channels);
        }
    }

    getAllStarredChannels=(isUpdatedStarredChannel)=>{
        let starreds = [];
        if(isUpdatedStarredChannel){
            this.state.usersRef.child(`${this.props.currentUser.uid}/starred`).on("child_added",snap=>{
                starreds.push({id:snap.key,...snap.val()});
            });
            this.props.getAllStarredChannels(starreds);
        }
    }

    removeListeners = ()=>{
        this.state.channelRef.off();
    }

    componentDidMount(){
        this._isMounted = true
        let avatar = '';
        const {privateChannel,channel} = this.state;
        //大頭貼
        this.state.usersRef.on('child_added',snap=>
        {
            if(!privateChannel && channel && (snap.val().name === channel.createBy.name)){
                avatar = snap.val().avatar;
                this.setState({createAvatar:avatar})
            }
        });
        //若有變更則會抓取頻道
        this.state.channelRef.on('value',snap=>{
            this.setState({isUpdatedChannel:true},()=>this.getAllChannels(this.state.isUpdatedChannel));
        });
        //若有變更且user有將此頻道加入我的最愛
        this.state.usersRef.child(`${this.props.currentUser.uid}/starred`).on('value',snap=>{
                this._isMounted && this.setState({isUpdatedStarredChannel:true},()=>this.getAllStarredChannels(this.state.isUpdatedStarredChannel));
            });
        //若此使用者現在正在使用此頻道
        if(this.props.currentChannel){
            this.state.channelRef.child(this.props.currentChannel.id).on("value",snap=>{
                    this.props.updatedCurrentChannel(snap.val());
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false
        this.removeListeners();
    }

    componentWillReceiveProps(nextProps){
        if(this.props.currentChannel &&
            nextProps.updatedChannel &&
            nextProps.currentChannel.id === nextProps.updatedChannel.id &&  
            !_.isEqual(this.props.updatedChannel,nextProps.updatedChannel)){
            this.setState({channel:nextProps.updatedChannel,
                channelName:nextProps.updatedChannel.name,
                channelDetails:nextProps.updatedChannel.details,
            });
        }

    }

    render() {
        const {activeIndex,privateChannel,channel,modal,channelName,channelDetails} = this.state;
        const {userPosts} = this.props;
        if(privateChannel) return null;
        return (
            <Segment loading={!channel}>
                <Header as="h3" attached="top">
                    About #{channel && channel.name}
                    <span style={{position:'absolute',right:10}} onClick={this.openModal}>
                        <Icon name="edit outline" />
                    </span>
                </Header>
                <Accordion styled attached="true">
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown"/>
                        <Icon name="info"/>
                        Channel Details
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        {channel && channel.details}
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown"/>
                        <Icon name="user circle"/>
                        Top Posters
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1}>
                        <List>
                        {userPosts && this.displayTopPosters(userPosts)}
                        </List>
                    </Accordion.Content>
                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name="dropdown"/>
                        <Icon name="pencil alternate"/>
                        Created By
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2}>
                        <Header as="h3">
                            <Image circular src={this.state.createAvatar}/>
                            {channel && channel.createBy.name}
                        </Header>

                    </Accordion.Content>
                </Accordion>
                {/* Edit Channel */}
                <Modal open={modal} onClose={this.closeModal} size="mini">
                    <Modal.Header>Edit Channel</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <Input 
                                fluid={true} 
                                label="Name of channel"
                                name="channelName"
                                value={channelName}
                                onChange={this.handleChange}/>
                            </Form.Field>
                            <Form.Field>
                                <Input 
                                    fluid={true} 
                                    label="About the channel"
                                    name="channelDetails"
                                    value={channelDetails}
                                    onChange={this.handleChange}/>
                            </Form.Field>
                               
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleEditChannel}>
                            <Icon name="checkmark"/>Save
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"/>Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Segment>
        );
    }
}

export default connect(null,{updatedCurrentChannel,getAllChannels,getAllStarredChannels})(MetaPanel);