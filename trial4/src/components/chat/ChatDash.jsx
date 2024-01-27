import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import {useNavigate} from 'react-router-dom'
import axios from 'axios'
import Messages from './Messages';
import { faArrowLeft, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
//import {} from 'font-awesome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const ChatDash = () => {
  const navigate=useNavigate()
  const [showUserList, setShowUserList] = useState(true);
  const [receivedMessageBlocked, setReceivedMessageBlocked] = useState(false);
  const receivedMessageTimeoutRef = useRef(null);
  const [resyncData, setResyncData] = useState(true);
  const id=localStorage.getItem('id')
  const [newMessage,setNewMessage]=useState(false)
  const [roomId, setRoomId] = useState('');
  const [userList, setUserList] = useState([]);
  const [userSelected, setUserSelected] = useState(null);
  const [userIsSelected, setUserIsSelected] = useState(false);
  const [messagePreview, setMessagePreview] = useState([]);
  const messageListRef = useRef(null);
  const [inputMessage, setInputMessage] = useState('');
  const [newSocket, setNewSocket]=useState(null)
  const [obtainedNicknames,setObtainedNicknames]=useState([])
  const [typing, setTyping] = useState(false);
  const url='https://api-brosforlyf.onrender.com'

  let typingTimeout;
if(newSocket){
  newSocket.on('userTyping', () => {
  setTyping(true);

  // Clear the existing timeout (if any)
  clearTimeout(typingTimeout);

  // Set a new timeout to revert typing to false after 1 second
  typingTimeout = setTimeout(() => {
    setTyping(false);
  }, 1000);
});
}
    const connectToBack = async () => {
      return new Promise((resolve) => {
        // Connect to the Socket.IO server
        const socket = io(url,{path:'/chat'});

        // Event handler for connection
        socket.on('connect', () => {
          console.log('Connected to Socket.IO server');
          resolve(socket);
        });

        // Event handler for disconnection
        socket.on('disconnect', () => {
          console.log('Disconnected from Socket.IO server');
        });

        // Clean up socket connection when the component unmounts
        
      });

    };

    

    const fetchUsers = async (socket) => {
      const res = await axios.get(`${url}/api/user/all`);
      const excludedCurrent = res.data.filter((user) => user._id !== id);
      const includeedCurrent = res.data.filter((user) => user._id === id);

      socket.emit('join room', { roomName: 'chatLobby', userId: includeedCurrent[0]._id});
      socket.emit('newUserOnline', { roomName: 'chatLobby' });

      socket.on('getUsersOnline', ({ nicknames }) => {
        setObtainedNicknames([...nicknames]);
      });

      const userData = excludedCurrent.map((user) => {
        
        return {
          ...user,
          online: obtainedNicknames.includes(user._id),
          imageUrl: `${url}/api/user/photo/${user.photo.filename}`,
        };
      });

      setUserList(userData);
    };
    const fetchUsersWithSocket = async () => {
      newSocket.emit('newUserOnline', { roomName: 'chatLobby' });

      newSocket.on('getUsersOnline', ({ nicknames }) => {
        setObtainedNicknames([...nicknames]);
      

      const userData = userList.map((user) => {
        
        return {
          ...user,
          online: nicknames.includes(user._id)
        };
      });

      setUserList(userData);
    });
    };

   
      if(resyncData && newSocket){
        console.log('Commence resyincing....')
        const syncDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
        syncDelay(1000)
        .then(()=>{
          fetchUsersWithSocket()
          .then(()=>{
            setResyncData(false)
            console.log("Completed Resync")
          })  
        })
               
        
      }
   
      useEffect(() => {
        // Scroll down to the latest message when the component mounts or when new messages arrive
        if (messageListRef.current) {
          console.log("Current")
          messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
      }, [messagePreview]);
  
  useEffect(() => {
    const fetchData=async()=>{
      const socket = await connectToBack()
      setNewSocket(socket);
      await fetchUsers(socket)
    }
  
    fetchData();
    return () => {
      if(newSocket){
        console.log('Offline mode....')
        newSocket.emit('outofRoom',{roomName:'chatLobby',userId:id})
        newSocket.disconnect();
      }
    };
  }, []); // Include 'id' in the dependency array
    
  if(newSocket){
    newSocket.on('reSync', () => {
      setResyncData(true)
      console.log('Resyncing...');
    });
    newSocket.on('receivedMessage', async () => {
      setNewMessage(true)
    })}
    useEffect(()=>{
      if(newMessage){
        const fetchNewMessages=()=>{
        if (!receivedMessageBlocked) {
          setReceivedMessageBlocked(true);
          if(userSelected){
          const sessionId = `${id}:${userSelected._id}`;
          setTimeout(async()=>{
          await axios.get(`${url}/api/chat/get/${sessionId}`).then((res) => {
            if (res.data.session.chatReplay.length !== 0) {
              const messages = res.data.session.chatReplay;
              setMessagePreview(messages);
            }
            setNewMessage(false)
          });
        },3000)
          // Allow subsequent emits after 1 second
          receivedMessageTimeoutRef.current = setTimeout(() => {
            setReceivedMessageBlocked(false);
          }, 1000);
        }
      }
        }
        fetchNewMessages()
      }
    },[newMessage])

    
  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };
  const formatTimestamp = (timestamp) => { 
    const formattedTimestamp = new Date(timestamp).toLocaleString('en-US', {hour:'numeric',minute:'2-digit'});
    return formattedTimestamp;
  };
  
  const handleLeave=()=>{
    if(newSocket){
      console.log('Offline mode....')
      newSocket.emit('outofRoom',{roomName:'chatLobby',userId:id})
      newSocket.disconnect();
    }
    navigate('/home')
  }
  const handleUserSelect=async (user)=>{
    setUserSelected(user)
    setUserIsSelected(true)
    setMessagePreview('')
    if(roomId){
      newSocket.emit('removeRoom',{roomName:roomId})
    }
    const sessionId=`${id}:${user._id}`
    const senderId=id
    const receiverId=user._id
    await axios.post(`${url}/api/chat/add`,{sessionId,senderId,receiverId}).then((res)=>{
      
      if(res.data.session.chatReplay.length!==0){
        const messages=res.data.session.chatReplay
        setMessagePreview(messages)
        
      }
    })
    newSocket.emit('join room', {roomName:sessionId, senderId,receiverId})
    setRoomId(sessionId)
  }


  const handleSendMessage =async () => {
    // Add logic to send messages
    // You might emit a 'sendMessage' event to the server
    if(inputMessage&&userSelected){
      //Sender:Receiver
      const sessionId=`${id}:${userSelected._id}`
      const senderId=id
      const receiverId=userSelected._id
      await axios.post(`${url}/api/chat/update/${sessionId}`,{sessionId,senderId,receiverId, message:inputMessage})
      .then((res)=>{
        
        if(res.data.session.chatReplay.length!==0){
          const messages=res.data.session.chatReplay
          setMessagePreview(messages)
          
        }
       })
      newSocket.emit('sendMessage',{roomName:sessionId, senderId, receiverId})
    }
   setInputMessage('')
  };

  return (
    <div className="chat-dash">
      <FontAwesomeIcon style={{ position: 'absolute', top: 4, left: 4, marginLeft: '2px', marginTop: '2px' }} icon={faArrowLeft} onClick={handleLeave}/>
      <h1>{!resyncData?'Chat Dashboard':'Connecting....'}</h1>
      <div className="content-container">
      <div className="toggle-button" onClick={toggleUserList}>
            {showUserList ? '>>' : '<<'}
          </div>
        <div className={`user-list ${showUserList ? 'visible' : 'hidden'}`}>
          <div className="user-list-content">
            <h2>Comrades</h2>
            {userList.length>0 ? userList.map((user) => (
              <div key={user._id} onClick={()=>{handleUserSelect(user)
              }} className="user">
                <div className="profile-avatar">
                <div className={`status-indicator ${user.online ? 'online' : 'offline'}`} />
                  <img src={user.imageUrl}/>
                </div>
                <div className="user-details">
                  <span>{user.username}</span>
                  
                </div>
              </div>
            )):(<div>No comrades To display!</div>)}
          </div>
        </div>
        {userIsSelected &&
        (
        <div className="message-preview overlay">
          <div style={{position:'absolute', cursor:'pointer', top:3,right:3}} onClick={()=>setUserIsSelected(false)}><FontAwesomeIcon icon={faTimes}/></div>
        <div className="message-header">
        <div className="user-header">
          <div className='profile'>
            <div className="profile-avatar">
                <div className={`status-indicator ${userSelected.online ? 'online' : 'offline'}`} />
                    <img src={userSelected.imageUrl}/>
            </div>
                <div className="user-details">
                    <span>{userSelected.username}</span>
                </div>
                     
            </div>
            <div style={{fontSize:"small", fontWeight:'lighter', marginLeft:'50px'}}>{typing?"typing....":''}</div> 
            </div>
        </div>
             
                {messagePreview.length>0 ?
                 (<div className="message-list"  ref={messageListRef}>{
                messagePreview.map((message) => (
                  <div key={message._id} className={message.senderId==userSelected._id?"talk-bubble tri-right round left-in":"talk-bubble tri-right round right-in"}>
                  <div className="talktext">
                    <p>{message.message}</p>
                   
                  </div>
                  <div style={{position:'absolute', bottom:0, right:20, fontSize:'12px'}}>{formatTimestamp(message.timestamp)}</div>
                </div>))}
                </div>
                ):(<div>{`Start A Chat :)`}</div>)}
              
              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) =>{ setInputMessage(e.target.value)
                    newSocket.emit('typing',{roomName:roomId})
                  }}
                />
                <button onClick={handleSendMessage}><FontAwesomeIcon icon={faPaperPlane}/></button>
              </div>
            </div>
              )}
      </div>
    </div>
  );
};

export default ChatDash;
