import React,{useState} from "react";

import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";
import Loader from "./spinners/Loader";

const Signup = () => {
    const navigate= useNavigate()
    const [fullname, setFullname]=useState('')
    const [sending, setsending]=useState(false)
    const [username, setUsername]=useState('')
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    const url='https://api-brosforlyf.onrender.com'

    const handleSubmit = async (e) => {
      setsending(true)
      
        e.preventDefault();
        
        if(!username||!email||!password){
          setsending(false)
            return
        }
        const signupData={fullname:username,username:username.trim(),email:email.trim(),password}

        try{
            await axios.post(`${url}/api/user/register`, signupData)
            .then((res)=>{
              setsending(false)
                const id=res.data.id
                localStorage.setItem("id",id)
                localStorage.setItem("email",email)
                setFullname('')
                setUsername('')
                setEmail('')
                setPassword('')
                navigate('/photo')
            })

        }
        catch(err){
            console.log(err)
            
        }


    }

  return (
    <div className="signup-container">
      {sending&&<div className="overlay">
      <div>Creating your account</div>
      <Loader/>
      </div>}
      <div className="signup-wrapper">
        <div className="signup-content">
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-group">
                <h1>Sign up</h1>
              <div className="signup-item">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" 
                placeholder='Create a unique username, like your name'
                required value={username} onChange={(e)=>setUsername(e.target.value)}/>
              </div>

              <div className="signup-item">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="eg: comrade @gmail.com" required value={email} onChange={(e)=>setEmail(e.target.value)}/>
              </div>

              <div className="signup-item">
                <label htmlFor="password">Password</label>
                <input type="password"  id="password" name="password" required value={password} onChange={(e)=>setPassword(e.target.value)}/>
              </div>
            </div>

            <div className="signup-actions">
              <button type="submit" style={{backgroundColor:sending&&'lightblue'}} disabled={sending}className="signup-button">Create Account</button>
            </div>
          </form>

          <p className="signup-login-link">
            Already have an account? <span onClick={()=>navigate('/login')}>Log in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
