import React, { Component } from 'react';
import { Grid, Header,Icon, Dropdown,Image,Modal,Input,Button } from 'semantic-ui-react';
import firebase from 'firebase';
import AvatarEditor from 'react-avatar-editor';

class UserPanel extends Component {
    state = {
        user:this.props.currentUser,
        previewImage:'',
        croppedImage:'',
        blob:'',
        storageRef:firebase.storage().ref(),
        userRef:firebase.auth().currentUser,
        usersRef:firebase.database().ref('users'),
        metadata:{
            contentType:'image/jpeg'
        },
        uploadCroppedImage:''
    }
    componentDidMount(){
        this.setState({
            user:this.props.currentUser,
            modal:false,
        })
    }

    openModal = ()=>this.setState({modal:true});
    closeModal = ()=>this.setState({modal:false});

    dropdownOption = ()=>{
        const {user} = this.state; 
        return ([
            {
                key:"user",
                // text:<span>Signd in as <strong>{user && user.displayName}</strong></span>,
                text:<span>Signd in as <strong>{user.displayName}</strong></span>,
                disabled:true
            },
            {
                key:"avatar",
                text:<span onClick={this.openModal}>Change avatar</span>

            },
            {
                key:"signout",
                text:<span onClick={this.handleSignOut}>Sign out</span>
            }    
        ])
    }

    handleSignOut=()=>{
        firebase
        .auth()
        .signOut()
        .then(()=>{
            console.log("sign out")
        })
        .catch((err)=>{
            console.log(err);
        })
    }

    handleChange = e=>{
        const file = e.target.files[0];
        const reader = new FileReader();
        if(file){
            reader.readAsDataURL(file);
            reader.addEventListener('load',()=>{
                this.setState({previewImage:reader.result});
            })
        }
    }

    handleCropImage = ()=>{
        if(this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob=>{
                let imageUrl = URL.createObjectURL(blob);
                this.setState({croppedImage:imageUrl,blob})
            })
        }
    }

    uploadCroppedImage = ()=>{
        const {storageRef,userRef,blob,metadata} = this.state;
        storageRef
        .child(`avatars/user/${userRef.uid}`)
        .put(blob,metadata)
        .then(snap=>{
            snap.ref.getDownloadURL().then(downloadUrl=>{
                this.setState({uploadCroppedImage:downloadUrl},()=>this.changeAvatar())
            })
        })
    }

    changeAvatar = ()=>{
        this.state.userRef
        .updateProfile({photoURL:this.state.uploadCroppedImage})
        .then(()=>{
            console.log('photoUrl updated');
            this.closeModal();
        })
        .catch(err=>{
            console.error(err);
        });

        this.state.usersRef
        .child(this.state.userRef.uid)
        .update({avatar:this.state.uploadCroppedImage})
        .then(()=>{
            console.log('user avatar uploaded');
        })
        .catch(err=>{
            console.error(err);
        })
    }
    render() {
        const {user,modal,previewImage,croppedImage} = this.state;
        const {primaryColor} = this.props;
        return (
            <Grid style={{backgroundColor:primaryColor}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em',margin:0}}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="discussions"/>
                            <Header.Content>Chat</Header.Content>
                        </Header>
                    </Grid.Row>
                    <Grid.Row>
                        <Header style={{padding:'0.25em'}} as="h4" inverted>
                            <Dropdown trigger={
                                <span>
                                    <Image src={user.photoURL} spaced="right" avatar/>
                                    {user.displayName}
                                </span>} options={this.dropdownOption()}/>
                        </Header>
                    </Grid.Row>
                    <Modal open={modal} onClose={this.closeModal}>
                        <Modal.Header>Change Avatar</Modal.Header>
                        <Modal.Content>
                            <Input 
                            fluid={true}
                            label="new avatar"
                            name="previewImage"
                            type="file"
                            onChange={this.handleChange}/>
                            <Grid centered stackable columns={2}>
                                <Grid.Row>
                                    <Grid.Column className="ui center aligned grid">
                                        {previewImage && (
                                            <AvatarEditor
                                                ref={node=>this.avatarEditor = node}
                                                image={previewImage}
                                                width={120}
                                                height={120}
                                                border={50}
                                                scale={1.2}
                                            />
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {croppedImage && (
                                            <Image
                                                style={{margin:'3.5em auto'}}
                                                width={100}
                                                height={100}
                                                src={croppedImage}
                                            />
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {
                            croppedImage && 
                            <Button color="green" inverted onClick={this.uploadCroppedImage}>
                                <Icon name="save" /> Change Avatar
                            </Button>
                            }
                            <Button color="green" inverted onClick={this.handleCropImage}>
                                <Icon name="image"/>Preview
                            </Button>
                            <Button color="red" inverted onClick={this.closeModal}>
                                <Icon name="remove"/>Cancel
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>
            </Grid>
        );
    }
}

export default UserPanel;