import React, { Component } from 'react';
import {Header,Segment,Input,Icon} from 'semantic-ui-react';

class MessageHeader extends Component {
    render() {
        const {channelName,numUniqueUsers,handleSearchChange,searchLoading,isPrivateChannel} = this.props;
        return (
            <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{marginBottom:0}}>
                <span>
                {channelName}
                {!isPrivateChannel && <Icon name={"star outline"} color="black"/>}
                </span>
                <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>
                <Header floated="right">
                    <Input 
                        size="mini" 
                        icon="search"
                        name="searchTerm"
                        placeholer="Search Messages"
                        loading={searchLoading}
                        onChange={handleSearchChange}/>
                </Header>
            </Segment>
        );
    }
}

export default MessageHeader;