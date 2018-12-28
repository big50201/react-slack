import React, { Component } from 'react';
import {Grid,Form,Segment,Button,Header,Message,Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';
class Register extends Component {
    state ={
        username:'',
        email:'',
        password:'',
        passwordConfirmation:'',
        errors:[],
        loading:false,
        userRef:firebase.database().ref('users')
    };
    handleChange= (e)=>{
        this.setState({[e.target.name]:e.target.value})
    }

    isFormValidated = ()=>{
        let errors=[];
        let error;
        if(this.isFormEmpty(this.state)){
            //throw error
            error={message:'Fill in all fields'};
            this.setState({errors:errors.concat(error),loading:false});
            return false;
        }else if(!this.isPasswordValidated(this.state)){
            //throw error
            error={message:'password invalid'};
            this.setState({errors:errors.concat(error),loading:false});
        }else{
            //form validated
            return true;
        }
    }

    isFormEmpty = ({username,email,password,passwordConfirmation})=>{
        return !username.length||!email.length||!password.length||!passwordConfirmation.length;
    }

    isPasswordValidated = ({password,passwordConfirmation})=>{
        if(password.length<6 ||passwordConfirmation<6){
            return false;
        }else if(password!==passwordConfirmation){
            return false;
        }else{
            return true;
        }
    }
    handleSubmit = (e)=>{
        let errors=[];
        e.preventDefault();
        this.setState({errors:[],loading:true});
        if(this.isFormValidated()){
            firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email,this.state.password)
            .then(result=>{
                console.log(result);
                result.user.updateProfile({
                    displayName:this.state.username,
                    photoURL:`http://gravatar.com/avatar/${md5(result.user.email)}?d=identicon`
                }).then(()=>{
                    this.setState({loading:false});
                    this.saveUser(result).then(()=>{
                        console.log('user saved');
                    })
                }).catch(err=>{
                    console.log(err);
                    this.setState({errors:errors.concat(err),loading:false});
                })
            })
            .catch(err=>{
                console.log(err);
                this.setState({errors:errors.concat(err),loading:false});
            })
        }
        
    }

    saveUser = result=>{
        return this.state.userRef.child(result.user.uid).set({
            name:result.user.displayName,
            avatar:result.user.photoURL
        });
    }
    displayErrors = (errors)=>errors.map((error,i)=>(<p key={i}>{error.message}</p>));
    handleInputError=(errors,inputName)=>{
        return (errors.some((error)=>
        error.message.toLowerCase().includes(inputName)) 
        ? 
        'error'
        :'')
    }
    render() {
        const {username,email,password,passwordConfirmation,errors,loading} = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h2" icon color="blue" textAlign="center">
                        <Icon name="user circle outline" color="blue"/>
                        Register
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input 
                            fluid={true} 
                            name="username" 
                            icon="user" 
                            iconPosition="left" 
                            placeholder="Username" 
                            onChange={this.handleChange} 
                            type="text" 
                            value={username}/>
                            <Form.Input 
                            fluid={true}
                            name="email" 
                            icon="mail" 
                            iconPosition="left" 
                            placeholder="Email Address" 
                            onChange={this.handleChange}
                            className={this.handleInputError(errors,'email')} 
                            type="email" 
                            value={email}/>
                            <Form.Input 
                            fluid={true} 
                            name="password" 
                            icon="lock" 
                            iconPosition="left" 
                            placeholder="Password" 
                            onChange={this.handleChange} 
                            className={this.handleInputError(errors,'password')} 
                            type="password" 
                            value={password}/>
                            <Form.Input 
                            fluid={true} 
                            name="passwordConfirmation" 
                            icon="repeat" iconPosition="left" 
                            placeholder="Password Confirmation" 
                            onChange={this.handleChange} 
                            className={this.handleInputError(errors,'password')} 
                            type="password" 
                            value={passwordConfirmation}/>
                            <Button 
                            disabled={loading}
                            className = {loading ? 'loading':''}
                            color="blue" 
                            fluid="true" 
                            size="large"
                            >Submit</Button>
                          
                        </Segment>
                    </Form>
                    {this.state.errors.length>0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>
                                Already a user?<Link to="/login">Login</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Register;