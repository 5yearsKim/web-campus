import React from 'react';
import { Auth } from "aws-amplify";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class Login extends React.Component{
  state = {
    username : "",
    password : ""
  }

  onSubmit = async event => {
    event.preventDefault();
    // AWS Cognito integration here
    try {
      console.log("username:", this.state.username);
      const user = await Auth.signIn(this.state.username, this.state.password);
      console.log(user);
      this.props.auth.setAuthStatus(true);
      this.props.auth.setUser(user);
      this.props.history.push("/");
    }catch(error) {
      console.log(error);
    }
  };

  onInputChange = event =>{
    this.setState(
      {
        [event.target.name] : event.target.value
      }
    )
  }

  render(){
    return(
      <form onSubmit={this.onSubmit}>
        <div>
          <TextField
            name="username"
            label="ID or school email"
            value={this.username}
            onChange={this.onInputChange}
          /> 
        </div>
        <div>
          <TextField
            name="password"
            label="Password"
            value={this.password}
            type="password"
            onChange={this.onInputChange}
          />
        </div>
        <p>
          <a href="/forgotpassword">비밀번호 찾기</a>
        </p>
        <Button
          variant="contained"
          color="primary"
          type="submit"
        >
          login
        </Button>
      </form>
    )
  }
}

export default Login;