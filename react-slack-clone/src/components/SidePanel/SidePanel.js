import React, { Component } from 'react';
import {Menu} from 'semantic-ui-react';
import UserPanel from './UserPanel';
import Channels from './Channels';
import DirectMessages from './DirectMessages';
import Starred from './Starred';

class SidePanel extends Component {
    render() {
        const {currentUser,primaryColor,currentChannel,updatedChannel,allChannels,starreds,isPrivateChannel} = this.props;
        return (
            <Menu
                size="large"
                inverted
                fixed="left"
                vertical
                style={{backgroundColor:primaryColor,fontSize:'1.2rem'}}>
                <UserPanel primaryColor={primaryColor} currentUser={currentUser}/>
                <Starred 
                currentUser={currentUser} 
                currentChannel={currentChannel} 
                updatedChannel={updatedChannel} 
                isPrivateChannel={isPrivateChannel} 
                starreds={starreds}/>
                <Channels 
                currentUser={currentUser} 
                currentChannel={currentChannel} 
                updatedChannel={updatedChannel} 
                allChannels={allChannels}/>
                <DirectMessages currentUser={currentUser} currentChannel={currentChannel} />
            </Menu>
        );
    }
}

export default SidePanel;