import React, { Component } from 'react';
import {Segment,Accordion,Header,Icon,Image,List} from 'semantic-ui-react';

class MetaPanel extends Component {
    state = {
        activeIndex:0,
        privateChannel:this.props.isPrivateChannel,
        channel:this.props.currentChannel
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

    formatCount = count=> count >1 || count == 0 ? `${count} posts`:`${count} post`;

    render() {
        const {activeIndex,privateChannel,channel} = this.state;
        const {userPosts} = this.props;
        if(privateChannel) return null;
        return (
            <Segment loading={!channel}>
                <Header as="h3" attached="top">About #{channel && channel.name}</Header>
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
                            <Image circular src={channel && channel.createBy.avatar}/>
                            {channel && channel.createBy.name}
                        </Header>

                    </Accordion.Content>
                </Accordion>
            </Segment>
        );
    }
}

export default MetaPanel;