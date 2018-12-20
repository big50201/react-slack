import React, { Component } from 'react';
import { Grid, Header,Icon, Dropdown } from 'semantic-ui-react';
import firebase from 'firebase';

class UserPanel extends Component {
    dropdownOption = ()=>{
        return ([
            {
                key:"user",
                text:<span>Signd in as <strong>User</strong></span>,
                disabled:true
            },
            {
                key:"avatar",
                text:<span>Change avatar</span>

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
    render() {
        return (
            <Grid style={{backgroundColor:'#4c3c4c'}}>
                <Grid.Column>
                    <Grid.Row style={{padding:'1.2em',margin:0}}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="code"/>
                            <Header.Content>Chat</Header.Content>
                        </Header>
                    </Grid.Row>
                    <Header style={{padding:'0.25em'}} as="h4" inverted>
                        <Dropdown trigger={<span>User</span>} options={this.dropdownOption()}/>
                    </Header>
                </Grid.Column>
            </Grid>
        );
    }
}

export default UserPanel;