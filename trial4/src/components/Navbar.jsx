// Navbar.js
import React, { useEffect, useState } from 'react';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { useContext } from 'react';
import { sidebarContext } from './Home';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHamburger } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
    const [username,setusername]=useState('')
    const [userId,setuserId]=useState('')
    const navigate=useNavigate()
    const {selectedCategory,isSidebarOpen,setSidebarOpen}=useContext(sidebarContext)
    const [profilePhotoId,setprofilePhotoId]=useState('')
    useEffect(()=>{
        const getUserData=async()=>{
            try{
              const id=localStorage.getItem('id')
              
              if(!id){
                navigate('/login')
              }
              setuserId(id)
                await axios.get(`https://api-brosforlyf.onrender.com/api/user/current/${id}`)
                .then((res)=>{
                  console.log(res)
                  setusername(res.data.user.username)
                  setprofilePhotoId(res.data.user.photo.filename)
                })
            }
            catch(err){
                console.log(err)
            }
        }
        getUserData()
    },[])

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span><FontAwesomeIcon style={{cursor:'pointer'}} onClick={()=>setSidebarOpen(prev=>!prev)} icon={faBars}/></span>
      </div>
     
      <div className="navbar-right">
      <div style={{marginRight:'20px', cursor:'pointer', }} onClick={()=>navigate('/chat')}>Chat</div>
      <div style={{marginRight:'20px', cursor:'pointer', }} onClick={()=>navigate('/huddle')}>Huddle</div>
        <div className='post-plus-btn' onClick={()=>navigate('/post')}>
          <div className='post-plus'>+</div>
          <div className='post-text'>Post</div>
        </div>
        
        <div className="profile-photo">
          <img src={`https://api-brosforlyf.onrender.com/api/user/photo/${profilePhotoId}`||'user.jpg'} alt="Profile" title={username} onClick={()=>navigate(`/profile/${userId}`)}/>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
