import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom'
import Cross from './spinners/Cross';
import Greentick from './spinners/Greentick';
import axios from 'axios'
import Loader from './spinners/Loader';

const Login = () => {
    const navigate= useNavigate()
    const [username, setUsername]=useState('')
    const [email, setEmail]=useState('')
    const [showOverlay, setShowOverlay]=useState(false)
    const [error, setError]=useState('')
    const [usernameerror, setUsernameerror]=useState('')
    const [passworderror, setPassworderror]=useState('')
    const [displayusererror, setDisplayusererror]=useState(false)
    const [displaypassError, setDisplaypassError]=useState(false)
    const [password, setPassword]=useState('')
    const [sending, setSending]=useState(false)
    const [usernameOrEmail, setUsernameOrEmail]=useState('')
    const [loginStatus, setLoginStatus] = useState(null); // New state for login status
    const url='https://api-brosforlyf.onrender.com'



    const handleSubmit = async (e) => {
        setSending(true)
        e.preventDefault();
        
        setLoginStatus(null); // Reset login status
        let loginData
        if(!usernameOrEmail){
            setUsernameerror("*The username is required")
            setDisplayusererror(true)
            setTimeout(()=>setDisplayusererror(false),2000)
        }
        if(!password){
            setPassworderror("*The password is required")
            setDisplaypassError(true)
            setTimeout(()=>setDisplaypassError(false),2000)
            return
        }
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        const isEmail = emailRegex.test(usernameOrEmail);
        if (isEmail){
            setEmail(usernameOrEmail)
            loginData={email:usernameOrEmail.trim(),password:password}
        }else{
            setUsername(usernameOrEmail)
            loginData={username:usernameOrEmail.trim(),password:password}
        }
        try{
            await axios.post(`${url}/api/user/login`, loginData)
            .then((res)=>{
                const id=res.data.id
                setShowOverlay(true); // Show overlay on form submission
                setLoginStatus(true); // Login successful
                setSending(false)
                setUsernameOrEmail('')
                setUsername('')
                setEmail('')
                setPassword('')
                localStorage.setItem('id',id)
                setTimeout(()=>{
                    setShowOverlay(false)
                    navigate('/home')
                },3000)
            })
        }
        catch(err){
            console.log(err)
            setShowOverlay(true); // Show overlay on form submission
            setSending(false)
            setLoginStatus(false); // Login successful
            setError(err.response.data.msg)
            setTimeout(()=>setShowOverlay(false),3000)
        }

       
    }
    return (
        <div className="login-container">
            {sending&&
            <div className='overlay'>
            <p>Looking for you...</p>
            <Loader/>
            </div>
            }
            <div className="login-content">
                <div className="login-header">
                    <h1>Login</h1>
                    <p>Welcome back! Please sign in to your account.</p>
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div style={{position:'relative'}}className="form-group">
                        <label htmlFor="usernameOrEmail">Username or Email:</label>
                        <input type="text" id="usernameOrEmail" name="usernameOrEmail"
                        value={usernameOrEmail}
                        onChange={(e)=>setUsernameOrEmail(e.target.value)}
                         />
                         {displayusererror &&(<div style={{color:'red', fontSize:'small', position:'absolute', left:0,}}>{usernameerror}</div>)}
                    </div>
                    <div style={{position:'relative'}} className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" 
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        />
                        {displaypassError &&(<div style={{color:'red',fontSize:'small', position:'absolute', left:0}}>{passworderror}</div>)}
                    </div>
                    <button disabled={sending} type="submit">Login</button>
                    {showOverlay && (
                <div className={`overlay ${loginStatus === true ? 'success' : 'failure'}`}>
                    <span className="close-btn" onClick={() => setShowOverlay(false)}>×</span>
                    {loginStatus === true ? (
                    <Greentick />
                    
                    ) : (
                    
                    <Cross err={error} />
                    
                    )}
                </div>
                )}
                </form>
                <p style={{cursor:'pointer'}}  className="signup-link" onClick={()=>navigate('/signup')}>
                    Don't have an account? <span>Sign up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
