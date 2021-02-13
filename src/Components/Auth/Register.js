import React from 'react';
import {Auth} from 'aws-amplify';
import config from "../../config.json";

import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

import { render } from '@testing-library/react';
import { Input } from '@material-ui/core';

class Register extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      currentStep:1,
      campus:'',
      campusDomain:[],
      graduate: "학부",
      department: '',
      division:'',
      year:'',
      username:'',
      email:'',
      password:'',
      passwordConfirm:'',
      emailVerification: '',
      _campusList: [],
      _departmentList:[],
      _divisionList:[]
    }
  }

  componentDidMount(){
    this.bringCampusList();
  }
  handleChange = event => {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSignup = () => {
    return new Promise((resolve, reject) => {
      const {username, email, password} = this.state;
      try {
        const signUpResponse = Auth.signUp({
          username,
          password,
          attributes: {
            email: email
          }
        });
        resolve(signUpResponse)
        console.log(signUpResponse);
      } catch (error) {
        reject(error)
      }
    })
  }

  confirmSignup =  () => {
    return new Promise((resolve, reject) => {
      try {
        const rsp = Auth.confirmSignUp(this.state.username, this.state.emailVerification);
        resolve(rsp)
      } catch (error) {
        console.log('error confirming sign up', error);
        reject(error);
      }
    })
  }

  resendConfirmationCode = async() => {
    try {
      await Auth.resendSignUp(this.username);
      console.log('code resent successfully');
    } catch (err) {
      console.log('error resending code: ', err);
    }
  }

  bringCampusList = () =>{
    fetch(`${config.api.campusURL}/find/campus`)
    .then((rsp) => rsp.json())
    .then((data) => {
      this.setState(
        {
          _campusList : data["data"]
        }
      )
    })
    .catch( (err)=>{
      console.log('error bringCampus', err);
    })
  }
  bringDepartmentList = (campus, graduate) => {
    if (graduate !== "학부" && graduate !== "대학원"){
      throw new Error("graduate with incorrect value")
    }
    if (this.state._campusList.includes(campus)){
      console.log(`${graduate}, ${campus}`)
      fetch(`${config.api.campusURL}/find/department?campus=${campus}&graduate=${graduate}`) 
      .then((rsp) => rsp.json()
      )
      .then((data) => {
        console.log(data);
        this.setState({
          _departmentList : data["data"]
        })
      }
      )
      .catch( (err)=>{
        console.log('error bringDepartment:', err);
      })

      fetch(`${config.api.campusURL}/campusDomain?campus=${campus}`) 
      .then((rsp) => rsp.json()
      )
      .then((data) => {
        console.log(data);
        this.setState({
          campusDomain : data["data"]
        })
      }
      )
      .catch( (err)=>{
        console.log('error', err);
      })
    }
  }
  bringDivisionList = (campus, graduate, department) => {
    if (graduate !== "학부" && graduate !== "대학원"){
      throw new Error("graduate with incorrect value");
    }
    if (graduate === "대학원"){
      return;
    }
    if (this.state._campusList.includes(campus)&&this.state._departmentList.includes(department)){
      console.log(`${graduate}, ${campus}, ${department}`)
      fetch(`${config.api.campusURL}/find/division?campus=${campus}&graduate=${graduate}&department=${department}`) 
      .then(
        (rsp) => rsp.json()
      )
      .then((data) => {
        console.log(data);
        this.setState({
          _divisionList : data["data"]
        })
      }
      )
      .catch( (err)=>{  
        console.log('error', err);
      })
    }
  }
  _next = () => {
    let currentStep = this.state.currentStep;
    let isOk = false;
    let msg = "";
    if (currentStep === 1){
      [isOk, msg] = this.checkStep1();
      [isOk, msg] = [true, 'hi']
      if (isOk) {
        this.setState(
          {
            currentStep : currentStep + 1
          }
        )
      } else{
        console.log(msg);
      }
    }
    if (currentStep === 2){
      [isOk, msg] = this.checkStep2()
      // [isOk, msg] = [true, 'hi']
      if (isOk) {
        this.handleSignup()
        .then((rsp) => {
          console.log(rsp)
          this.setState(
            {
              currentStep : currentStep + 1
            }
          )
        })
        .catch(err => {console.log(err)})
      } else{
        console.log(msg);
      }
    }
    if (currentStep === 3) {
      this.confirmSignup()
      .then((data) => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      })
    }
  }
  _prev = () => {
    let currentStep = this.state.currentStep;
    currentStep = currentStep <= 1? 1: currentStep - 1;
    this.setState({
      currentStep: currentStep
    })
  }
  checkStep1 = () => {
    console.log(this.state.campusDomain)
    if (this.state.campus === ''){
      return [false, "캠퍼스를 선택해주세요"];
    }
    if (this.state.graduate !== "학부" && this.state.graduate !== "대학원"){
      return [false, "학부, 대학원 여부를 선택해주세요."];
    }
    if (this.state.year === ''){
      return [false, "학번을 선택해주세요."];
    }
    if (this.state.department === ''){
      return [false, "단과대학을 선택해주세요."];
    }
    return [true, "step 1 success"];
  }
  checkStep2 = () => {
    var emailDomainCheck = (email, campusDomain) => {
      if (email === ''){
        return false;
      }
      for (let i = 0; i < campusDomain.length; i++){
        if (email.includes(campusDomain[i])){
          return true;
        }
      }
      return false;
    }
    if (this.state.username.length < 4){
      return [false, "ID 가 너무 짧습니다. (최소 4자)"];   
    }
    if (this.state.password.length < 8){
      return [false, "password 가 너무 짧습니다. (최소 8자)"];
    }
    if (this.state.password.length >= 30){
      return [false, "password 가 너무 깁니다. (최대 30자)"];
    }
    if (this.state.password.search(/[a-zA-Z]/) < 0) {
      return [false, "password 는 최소 1개의 알파벳을 포함하여야 합니다."];
    }
    if (this.state.password.search(/\d/) < 0) {
      return [false, "password는 최소 1개의 숫자를 포함하여야 합니다."]
    }
    if (this.state.password !== this.state.passwordConfirm){
      return [false, "비밀번호 확인이 일치하지 않습니다."];
    }
    if (!emailDomainCheck(this.state.email, this.state.campusDomain)){
      return [false, `${this.state.campus}의 email 도메인은 ${this.state.campusDomain} 이어야 합니다.` ];
    }
    return [true, 'step 2 success'];
  }
  previousButton = () => {
    let currentStep = this.state.currentStep;
    if(currentStep !==1){
      return (
        <Button 
          variant="contained"
          color="secondary"
          type="button" 
          onClick={this._prev}>
        Previous
        </Button>
      )
    }
    return null;
  }

  nextButton = () => {
    let currentStep = this.state.currentStep;
    if(currentStep === 1){
      return (
        <Button 
          variant="contained"
          color="primary"
          type="button"
          onClick={this._next}
          >
          Next
        </Button>        
      )
    }
    if (currentStep === 2){
      return (
        <Button 
          variant="contained"
          color="primary"
          onClick= {this._next}
          >
          confirm email
        </Button>        
      )     
    }
    if (currentStep === 3){
      return (
        <Button 
          variant="outlined"
          color="primary"
          onClick= {this._next}
          >
          SignUp 
        </Button>        
      )
    }
    return null;
  }
  Step1 = () => {
    if (this.state.currentStep !== 1){
      return null;
    }
    return (
      <div>
        <Autocomplete
          id="campus"
          options={this.state._campusList}
          getOptionLabel={(option) => option}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="대학 선택" variant="outlined" />}
          inputValue={this.state.campus}
          value={this.state.campus}
          onInputChange={(event, newValue) =>{
            event.preventDefault(); 
            this.setState(
              {
                campus: newValue,
                graduate:"학부",
                department:"",
                division:"",
              }
            )
            this.bringDepartmentList(newValue, this.state.graduate)
        
          }}
        />
        <Select
          id="graduate"
          name="graduate"
          value={this.state.graduate}
          onChange={(event)=> {
              this.handleChange(event);
              this.bringDepartmentList(this.state.campus, event.target.value);
            }
          }
          label="graduate"
        >
          <MenuItem value="학부">학부</MenuItem>
          <MenuItem value="대학원">대학원</MenuItem>
        </Select>
        <InputLabel id="yearLabel" >학번</InputLabel>
        <Select
          labelId="yearLabel"
          id="year"
          name="year"
          value={this.state.year} 
          onChange={this.handleChange}
        >
          <MenuItem value="21">21</MenuItem>
          <MenuItem value="20">20</MenuItem>
          <MenuItem value="19">19</MenuItem>
          <MenuItem value="18">18</MenuItem>
          <MenuItem value="17">17</MenuItem>
          <MenuItem value="16">16</MenuItem>
          <MenuItem value="15">15</MenuItem>
          <MenuItem value="14">14</MenuItem>
          <MenuItem value="13">13</MenuItem>
          <MenuItem value="12">12</MenuItem>
          <MenuItem value="11">11</MenuItem>
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="9">09</MenuItem>
          <MenuItem value="8">08</MenuItem>
        </Select>
        <Autocomplete
          id="department"
          options={this.state._departmentList}
          getOptionLabel={(option) => option}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="단과 대학" variant="outlined" />}
          onInputChange={(event, newValue) => {
            if (event == null){
              return null
            }
            this.setState(
              {
                department: newValue,
                division: ""
              }
            );
            this.bringDivisionList(this.state.campus, this.state.graduate, newValue)
          }}
          inputValue={this.state.department}
          value={this.state.department}
        />
        <Autocomplete
          id="division"
          freeSolo
          options={this.state._divisionList}
          getOptionLabel={(option) => option}
          style={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="학과" variant="outlined" />}
          onInputChange={(event, newValue) => {
            if (event == null){
              return null;
            }
            this.setState(
              {
                division: newValue
              }
            );
          }}
          inputValue={this.state.division}
          value={this.state.division}
        />
      </div>
    );
  }
  
  Step2 = () => {
    if (this.state.currentStep < 2){
      return null;
    }
    return (
      <div>
        <div>
          <TextField 
            id="username" 
            label="ID" 
            onChange={this.handleChange}
            value={this.state.username}
            name="username"
          />
        </div>
        <div>
          <TextField 
            id="password" 
            label="Password" 
            onChange={this.handleChange}
            type="password"
            value={this.state.password}
            name="password"
          />
        </div>
        <div>
          <TextField 
            id="passwordConfirm" 
            label="Password Confirmation" 
            onChange={this.handleChange}
            type="password"
            value={this.state.passwordConfirm}
            name="passwordConfirm"
          />
        </div>
        <div>
          <TextField
            id="email" 
            label="email" 
            onChange={this.handleChange}
            value={this.state.email}
            name="email"
          />
        </div>
      </div>

    )
  }
  Step3 = () => {
    if (this.state.currentStep < 3){
      return null;
    }
    return (
      <div>
        <TextField 
          id="emailVerification" 
          label="EmailVerification" 
          onChange={this.handleChange}
          value={this.state.emailVerification}
          name="emailVerification"
        />
      </div>
    )

  }

  render(){
    return (
      <React.Fragment>
      <h1>Register</h1>
      <p>Step {this.state.currentStep}</p>
      {this.Step1()}
      {this.Step2()}
      {this.Step3()}
      <div>
        {this.previousButton()}
        {this.nextButton()}
      </div>
      </React.Fragment>
    );
  }
}
  
export default Register;