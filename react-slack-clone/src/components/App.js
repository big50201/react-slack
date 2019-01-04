import React, { Component } from 'react';
import {Grid} from 'semantic-ui-react';
import './App.css';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import {connect} from 'react-redux';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      width: window.innerWidth, 
      height: window.innerHeight
    };
  }
  
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }
  
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions = ()=>{
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const {currentUser,currentChannel,isPrivateChannel,userPosts,primaryColor,secondaryColor} = this.props;
    return (
      <Grid columns="equal" className="app" style={{backgroundColor:secondaryColor,width:this.state.width,height:this.state.height}}>
        <ColorPanel 
        key={currentUser && currentUser.name}
        currentUser={currentUser}/>
        <SidePanel 
          key={currentUser && currentUser.uid}
          currentChannel={currentChannel}
          currentUser={currentUser}
          primaryColor={primaryColor}  
        />
        <Grid.Column style={{marginLeft:320}}>
          <Messages 
            key={currentChannel && currentChannel.id}
            currentChannel={currentChannel}
            currentUser = {currentUser}
            isPrivateChannel={isPrivateChannel}/>
        </Grid.Column>
        <Grid.Column width={4}>
          <MetaPanel 
            key={currentChannel && currentChannel.name}
            currentChannel = {currentChannel}
            isPrivateChannel={isPrivateChannel}
            userPosts={userPosts}
          />
        </Grid.Column>
      </Grid>
    );
  }
}

const mapStateToProps = state=>{
  return ({
    currentUser:state.user.currentUser,
    currentChannel: state.channel.currentChannel,
    isPrivateChannel:state.channel.isPrivateChannel,
    userPosts:state.channel.userPosts,
    primaryColor:state.colors.primaryColor,
    secondaryColor:state.colors.secondaryColor
  });
}
export default connect(mapStateToProps)(App);
