// Navbar.js
import React, { useEffect, useState } from 'react';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { useContext } from 'react';
import { sidebarContext } from './Home';


const Navbar = () => {
    const [username,setusername]=useState('')
    const [userId,setuserId]=useState('')
    const navigate=useNavigate()
    const {selectedCategory,isSidebarOpen,setSidebarOpen}=useContext(sidebarContext)
    const [profilePhotoId,setprofilePhotoId]=useState('')
    const url='https://api-brosforlyf.onrender.com'

    useEffect(()=>{
        const getUserData=async()=>{
            try{
              const id=localStorage.getItem('id')
              
              if(!id){
                navigate('/login')
              }
              setuserId(id)
                await axios.get(`${url}/api/user/current/${id}`)
                .then((res)=>{
                  setusername(res.data.user.username)
                  setprofilePhotoId(res.data.user.photo.filename)
                })
            }
            catch(err){
              if(err.response.data.msg==='User Not found!') navigate('/login')
              console.log(err)
            }
        }
        getUserData()
    },[])

  return (
    <nav className="navbar">
      <div className="scroll-msg">Currently the huddle and rest of the UI are still in progress meanwhile enjoy the app.</div>
      <div className="navbar-main">
      <div className="navbar-left">
        <span style={{cursor:'pointer'}} onClick={()=>setSidebarOpen(prev=>!prev)}>Bros For Life</span>
        {/* <span><FontAwesomeIcon style={{cursor:'pointer'}} onClick={()=>setSidebarOpen(prev=>!prev)} icon={faBars}/></span> */}
      </div>
     
      <div className="navbar-right">
      <div style={{marginRight:'20px', cursor:'pointer', }} onClick={()=>navigate('/chat')}>Chat</div>
      <div style={{marginRight:'20px', cursor:'pointer', }} onClick={()=>navigate('/huddle')}>Huddle</div>
        <div className='post-plus-btn' onClick={()=>navigate('/post')}>
          <div className='post-plus'>+</div>
          <div className='post-text'>Post</div>
        </div>
        
        <div className="profile-photo">
          <img src={`${url}/api/user/photo/${profilePhotoId}`||'user.jpg'} alt="Profile" title={username} onClick={()=>navigate(`/profile/${userId}`)}/>
          
        </div>
      </div>
      </div>
    </nav>
  );
};

export default Navbar;
