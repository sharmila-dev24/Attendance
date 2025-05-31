import React, { useState } from "react";
//import "./Login.css";
import {Link} from "react-router-dom";
import axios from 'axios';
import StaffView from './StaffView.js';
import Admins from './Admins.js';

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role,setRole]=useState(null);

  const handleLogin = async(e) => {
     e.preventDefault();
     try{
        const response=await axios.post('http://localhost:5000/login',{user_id:userId,password:password},{withCredentials:true});
        setRole(response.data.role);
     }catch(error){
        alert('login failed.. Please check your credentials');
        console.log(error)
     }
  };

  
  if (role === "staff") return <StaffView facultyId={userId} />;

  if(role==='admin')return <Admins />;
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
    <h2 className="text-center text-primary mb-4">ATTENDANCE MANAGEMENT SYSTEM</h2>
    <div className="col-lg-5 col-md-7 col-sm-10 shadow p-4 rounded bg-light">
     
        <h3 className="text-center text-secondary">LOGIN/SIGN-IN</h3>
        <form>
          <div className="mb-3">
          <label htmlFor="userId" className="form-label">User-id</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="form-control"
            required
          />
          </div>
          <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
          </div>
          
          <div className="form-check mb-3">
            <input
              type="checkbox"
              id="showPassword"
              className="form-check-input"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPassword" className="form-check-label">Show Password</label>
          </div>

          <button type="button" onClick={handleLogin} className="btn  btn-primary w-100">
            Login
          </button>
        </form>

        <div className="text-center mt-3">
          
          <Link to="#" className="d-block">Forgot UserId/Password</Link>
          <p>
            Don't have an account? <Link to="/">Register here</Link>
          </p>
        </div>
      </div>
    </div>
    
  );
};

export default Login;