import React, { Component } from 'react';
import {Sidebar,Menu,Divider,Button,Modal,Icon,Label,Segment} from 'semantic-ui-react';
import {SliderPicker} from 'react-color';
import firebase from '../../firebase';

class ColorPanel extends Component {
    state = {
        modal:false,
        primary:'',
        secondary:'',
        user:this.props.currentUser,
        userRef:firebase.database().ref('users')
    }

    openModal =()=>this.setState({modal:true});
    closeModal =()=>this.setState({modal:false});
    handleChangePrimary=color=>this.setState({primary:color.hex});
    handleChangeSecondary= color=>this.setState({secondary:color.hex});
    handleSaveColor = ()=>{
        if(this.state.primary && this.state.secondary){
            this.saveColors(this.state.primary,this.state.secondary);
        }
    }

    saveColors = (primary,secondary)=>{
        this.state.userRef.child(`${this.state.user.uid}/colors`)
        .push()
        .update({
            primary,
            secondary
        })
        .then(()=>{
            console.log('color added');
            this.closeModal();
        })
        .catch(err=>console.log(err));
    }
    render() {
        const {modal,primary,secondary} = this.state;
        return (
            <Sidebar
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin"
            >
                <Divider/>
                <Button icon="add" color="blue" size="small" onClick={this.openModal}/>
                <Modal open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content="Primary color"/>
                            <SliderPicker color={primary} onChange={this.handleChangePrimary}/>
                        </Segment>
                        <Segment inverted>
                            <Label content="Secondary color"/>
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondary}/>
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSaveColor}>
                            <Icon name="checkmark"/> Save Colors
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"/> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
               
            </Sidebar>
        );
    }
}

export default ColorPanel;