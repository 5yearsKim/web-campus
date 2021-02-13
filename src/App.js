import logo from './logo.svg';
import './App.css';
import React from 'react';
import {Auth} from 'aws-amplify';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import Home from './Home';
import Register from './Components/Auth/Register';
import Login from './Components/Auth/Login'; 
import SideRoutes from './Components/Sidebar/SideRoutes'
import Sidebar from './Components/Sidebar/Sidebar'
import sidebarImage from "./assets/img/reactlogo.png";


class App extends React.Component {
  state = {
    isAuthenticated: false,
    isAuthenticating: true,
    user: null,
    sideColor: "blue"
  }
  setAuthStatus = authenticated => {
    this.setState({ isAuthenticated: authenticated });
  }
  setUser = user => {
    this.setState({ user: user });
  }
  async componentDidMount() {
    try {
      const session = await Auth.currentSession();
      console.log(session)
      this.setAuthStatus(true);
      console.log(session);
      const user = await Auth.currentAuthenticatedUser();
      this.setUser(user);
    } catch(error) {
      if (error !== 'No current user') {
        console.log("session error:", error);
      }
    }
  
    this.setState({ isAuthenticating: false });
  }

  renderSidebar = () => {
    const getRoutes = (routes) => {
      return routes.map((prop, key) => {
        if (prop.layout !== "/Dashboard"){
          return null;
        }
        return (
          <Route
            path={prop.layout + prop.path}
            render={(props) => <prop.component {...props} />}
            key={key}
          />
        );
      });
    }
    if (!this.state.isAuthenticated){
      return ;
    }
    return (
      <React.Fragment>
        <Sidebar color={this.state.sideColor} image={sidebarImage} routes={SideRoutes} />
        <div>
          {getRoutes(SideRoutes)}
        </div>
      </React.Fragment>
    )
  }


  render(){
    const authProps = {
      isAuthenticated: this.state.isAuthenticated,
      user: this.state.user,
      setAuthStatus: this.setAuthStatus,
      setUser: this.setUser
    }
    return(
      // this.state.isAuthenticating &&
      <div className="wrapper">
        <Router>
          <div>
            <Switch>
              <Route exact path="/" render={
                (props) => <Home {...props} auth={authProps} />
              }/>
              <Route exact path="/register" render={
                (props) => <Register {...props} auth={authProps} />
              }/>
              <Route exact path="/login" render={
                (props) => <Login {...props} auth={authProps} />
              }/>
              {this.renderSidebar()}

            </Switch>
          </div>
        </Router>
      </div>
    )
  }
}


export default App;
