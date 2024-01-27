import './Init'
import React, { useEffect, useState } from 'react'
import Login from './components/Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import Signup from './components/Signup'
import OtpForm from './components/OTP'
import ProfilePhotoForm from './components/AddPhoto'
import UserProfile from './components/Userprofile'
import AddPost from './components/PostForm'
import ChatDash from './components/chat/ChatDash'
import { io } from 'socket.io-client'
import VoiceRoom from './components/voice/VoiceRoom'

const App = () => {
  

  return (
    <div className='main'>
      <Router>
        <Routes>
          <Route path='/*' element={<Home/>} />
          <Route exact path={'/home'} element={<Home/>}/>
          <Route  path={'/profile/:id'} element={<UserProfile/>}/>
          <Route  path={'/signup'} element={<Signup/>}/>
          <Route  path={'/login'} element={<Login/>}/>
          <Route  path={'/otp'} element={<OtpForm/>}/>
          <Route  path={'/photo'} element={<ProfilePhotoForm/>}/>
          <Route  path={'/post'} element={<AddPost/>}/>
          <Route  path={'/chat'} element={<ChatDash />}/>
          <Route  path={'/huddle'} element={<VoiceRoom />}/>
        </Routes>
        </Router>
      </div>
  )
}

export default App