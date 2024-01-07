import React, { useState } from 'react'

const Messages = ({messagePreview, userSelected, newSocket, handleSendMessage, inputMessage, setInputMessage }) => {
  const [typing, setTyping] = useState(false);
  let typingTimeout;

  newSocket.on('userTyping', () => {
  setTyping(true);

  // Clear the existing timeout (if any)
  clearTimeout(typingTimeout);

  // Set a new timeout to revert typing to false after 1 second
  typingTimeout = setTimeout(() => {
    setTyping(false);
  }, 1000);
});
  return (
    <>
    <div className="message-preview">
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
          <div className="message-list">
            {messagePreview.length>0 ?messagePreview.map((message) => (
              <div key={message._id} className={message.senderId==userSelected._id?"talk-bubble tri-right round left-in":"talk-bubble tri-right round right-in"}>
              <div className="talktext">
                <p>{message.message}</p>
              </div>
            </div>
            )):(<div>{`Start A Chat :)`}</div>)}
          </div>
          <div className="message-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) =>{ setInputMessage(e.target.value)
                newSocket.emit('typing')
              }}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
    
          </>
  )
}

export default Messages