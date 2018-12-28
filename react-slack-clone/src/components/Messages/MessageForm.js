import React, { Component } from 'react';
import {Segment,Button,Input} from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from './FileModal';
import uuidv4 from 'uuid/v4';
import ProgressBar from './ProgressBar';
class MessageForm extends Component {
    state = {
        message:'',
        channel:this.props.currentChannel,
        isLoading:false,
        user:this.props.currentUser,
        errors:[],
        modal:false,
        uploadState:'',
        uploadTask:null,
        storageRef:firebase.storage().ref(),
        percentUploaded:0
    }

    openModal = ()=>this.setState({modal:true});

    closeModal = ()=>this.setState({modal:false});

    handleChange = e=>{
        this.setState({[e.target.name]:e.target.value});
    }

    sendMessage = ()=>{
        const {getMessageRef} = this.props;
        const {message,channel} = this.state;
        if(message){
            getMessageRef()
            .child(channel.id)
            .push()
            .set(this.createMessage())
            .then(()=>{
                this.setState({
                    isLoading:false,
                    message:'',
                    errors:[]
                })
            })
            .catch((err)=>{
                console.log(err);
                this.setState({errors:this.state.errors.concat(err),isLoading:false})
            })
            this.setState({isLoading:true});
        }else{
            this.setState({
                errors:this.state.errors.concat({message:'add a message'})
            })
        }
    }

    createMessage = (fileUrl=null)=>{
        const {user} = this.state
        const message = {
            timestamp:firebase.database.ServerValue.TIMESTAMP,
            user:{
                id:user.uid,
                name:user.displayName,
                avatar:user.photoURL
            }
        }
        if(fileUrl!==null){
            message['image'] = fileUrl;
        }else{
            message['content'] = this.state.message;
        }
        return message;
    }

    uploadFile = (file,metadata)=>{
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessageRef();
        const filepath = `${this.getPath()}/${uuidv4()}.jpg`;
        this.setState({
            uploadState:'uploading',
            uploadTask:this.state.storageRef.child(filepath).put(file,metadata)
        },()=>{
           this.state.uploadTask.on('state_changed',snap=>{
                const percentUploaded = Math.round((snap.bytesTransferred/snap.totalBytes)*100);
                this.props.isProgressVisiable(percentUploaded);
                this.setState({
                    percentUploaded
                });
           },err=>{
               console.log(err);
               this.setState({
                   errors:this.state.errors.concat(err),
                   uploadState:'error',
                   uploadTask:null
               })
           },()=>{
               this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl=>{
                   this.sendFileMessage(downloadUrl,ref,pathToUpload);
               }).catch(err=>{
                    console.log(err);
                    this.setState({
                        errors:this.state.errors.concat(err),
                        uploadState:'error',
                        uploadTask:null
                    })
               })
           }) 
        })
    }

    sendFileMessage = (fileUrl,ref,pathToUpload)=>{
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(()=>this.setState({uploadState:'done'}))
            .catch(err=>{
                console.log(err);
                this.setState({
                    errors:this.state.errors.concat(err)
                });
            })
    }

    getPath = ()=>{
        if(this.props.isPrivateChannel){
            return `chat/private-${this.state.channel.id}`
        }else{
            return `chat/public`
        }
    }
    render() {
        const {errors,message,isLoading,modal,uploadState,percentUploaded} = this.state;
        return (
            <Segment className="message__form">
                <Input
                    fluid={true}
                    name="message"
                    style={{marginBottom:'0.7em'}}
                    label={<Button icon="add"/>}
                    labelPosition="left"
                    placeholder="Write your message"
                    onChange={this.handleChange}
                    className={errors.some(err=>err.message.includes('message')) ? 'error':''}
                    value={message}
                />
                <Button.Group icon widths="2">
                    <Button
                        disabled={isLoading}
                        color="yellow"
                        content="Add Apply"
                        labelPosition="left"
                        icon="edit"
                        onClick={this.sendMessage}
                    />
                    <Button
                        disabled={this.uploadState === "uploading"}
                        color="teal"
                        onClick={this.openModal}
                        content="Upload Media"
                        labelPosition="left"
                        icon="upload"
                    />
                </Button.Group>
                <FileModal 
                    modal={modal} 
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}/>
                <ProgressBar
                    uploadState={uploadState}
                    percentUploaded={percentUploaded}
                />
            </Segment>
        );
    }
}

export default MessageForm;