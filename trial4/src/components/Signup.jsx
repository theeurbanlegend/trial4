import React,{useState} from "react";

import axios from "axios";
import "../App.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate= useNavigate()
    const [fullname, setFullname]=useState('')
    const [username, setUsername]=useState('')
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!fullname||!username||!email||!password){
            return
        }
        const signupData={fullname,username,email,password}

        try{
            await axios.post('https://api-brosforlyf.onrender.com/api/user/register', signupData)
            .then((res)=>{
                console.log(res)
                const id=res.data.id
                localStorage.setItem("id",id)
                setFullname('')
                setUsername('')
                setEmail('')
                setPassword('')
                navigate('/otp')
            })
        }
        catch(err){
            console.log(err)
            
        }

        console.log("Submitted")
    }

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        <div className="signup-content">
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="signup-group">
                <h1>Create Account</h1>
              <div className="signup-item">
                <label htmlFor="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" required value={fullname} onChange={(e)=>setFullname(e.target.value)} />
              </div>
              <div className="signup-item">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required value={username} onChange={(e)=>setUsername(e.target.value)}/>
              </div>

              <div className="signup-item">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" name="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/>
              </div>

              <div className="signup-item">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required value={password} onChange={(e)=>setPassword(e.target.value)}/>
              </div>
            </div>

            <div className="signup-actions">
              <button type="submit" className="signup-button">Create Account</button>
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
