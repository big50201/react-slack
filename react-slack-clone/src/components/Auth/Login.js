import React, { Component } from 'react';
import firebase from 'firebase';
import {Grid,Header,Icon,Form,Button,Segment,Message} from 'semantic-ui-react';
import {Link} from 'react-router-dom';

class Login extends Component {
    state ={
        email:'',
        password:'',
        errors:[],
        loading:false,
    };
    handleChange= (e)=>{
        this.setState({[e.target.name]:e.target.value})
    }

   
    handleSubmit = (e)=>{
        let errors=[];
        const {email,password} = this.state;
        e.preventDefault();
        if(this.isFormValid(this.state)){
            this.setState({errors:[],loading:true});
            firebase
            .auth()
            .signInWithEmailAndPassword(email,password)
            .then((signInUser)=>{
                console.log(signInUser)
            })
            .catch((err)=>{
                console.log(err);
                this.setState({
                    errors:errors.concat(err),
                    loading:false
                });
            })
        }
        
    }
    
    isFormValid = ({email,password})=> email && password;
    
    displayErrors = (errors)=>errors.map((error,i)=>(<p key={i}>{error.message}</p>));
    handleInputError=(errors,inputName)=>{
        return (errors.some((error)=>
        error.message.toLowerCase().includes(inputName)) 
        ? 
        'error'
        :'')
    }
    render() {
        const {email,password,errors,loading} = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450}}>
                    <Header as="h2" icon color="black" textAlign="center">
                        <Icon name="code branch" color="black"/>
                        Login
                    </Header>
                    <Form onSubmit={this.handleSubmit} size="large">
                        <Segment stacked>
                            <Form.Input fluid 
                            name="email" 
                            icon="mail" 
                            iconPosition="left" 
                            placeholder="Email Address" 
                            onChange={this.handleChange}
                            className={this.handleInputError(errors,'email')} 
                            type="email" 
                            value={email}/>
                            <Form.Input fluid 
                            name="password" 
                            icon="lock" 
                            iconPosition="left" 
                            placeholder="Password" 
                            onChange={this.handleChange} 
                            className={this.handleInputError(errors,'password')} 
                            type="password" 
                            value={password}/>
                          
                            <Button 
                            disabled={loading}
                            className = {loading ? 'loading':''}
                            color="black" 
                            fluid 
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
                            Don't have an account?<Link to="/register">Register</Link>
                    </Message>
                </Grid.Column>
            </Grid>
        );
    }
}


export default Login;