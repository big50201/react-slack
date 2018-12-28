import React, { Component } from 'react';
import {Grid} from 'semantic-ui-react';
import './App.css';
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import {connect} from 'react-redux';
class App extends Component {
  render() {
    const {currentUser,currentChannel,isPrivateChannel,userPosts} = this.props;
    return (
      <Grid columns="equal" className="app" style={{backgroundColor:'#eee'}}>
        <ColorPanel/>
        <SidePanel 
          key={currentUser && currentUser.uid}
          currentUser={currentUser}/>
        <Grid.Column style={{marginLeft:320}}>
          <Messages 
            key={currentChannel && currentChannel.id}
            currentChannel={currentChannel}
            currentUser = {currentUser}
            isPrivateChannel={isPrivateChannel}/>
        </Grid.Column>
        <Grid.Column width={4}>
          <MetaPanel 
            key={currentChannel && currentChannel.id}
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
    userPosts:state.channel.userPosts
  });
}
export default connect(mapStateToProps)(App);
