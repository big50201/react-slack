import React from 'react';
import {Comment,Image} from 'semantic-ui-react';
import moment from 'moment';
const isOwnMessage = (message,user)=>{
    return message.user.id === user.uid ? 'message__self':'';
}

const isImage = message=>{
    return message.hasOwnProperty('image')&& !message.hasOwnProperty('content');
}

const isLinkMessage = (content)=>{
    if(content.match('http')){
        return <Comment.Text><a href={content} target="_blank">{content}</a></Comment.Text>
    }else{
        return <Comment.Text>{content}</Comment.Text>
    }
}

const timeFromNow = timestamp=>moment(timestamp).fromNow();
const Message = ({message,user,avatar})=>(
    <Comment>
        <Comment.Avatar src={avatar}/>
        <Comment.Content className={isOwnMessage(message,user)}>
            <Comment.Author as="a">{message.user.name}</Comment.Author>
            <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
            {isImage(message) ? 
            <Image src={message.image} className="message__image" />:
            isLinkMessage(message.content)
            }
        </Comment.Content>
    </Comment>
);

export default Message;