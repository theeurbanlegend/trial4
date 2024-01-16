const express = require('express');
const http = require('http');
const {Server}= require('socket.io');
const connectDB = require('./db/db');
const postRoute = require('./routes/postRoutes');
const generateOtp = require('./mail_api/otpGenerator');
const sendemail = require('./mail_api/sendEmail');
const userRoute = require('./routes/userRoutes');
const cors = require('cors');
const connectToRoom = require('./socket/connectToRoom');
const SimplePeer = require('simple-peer');
const disconnectFromRoom = require('./socket/disconnectFromRoom');
const dismissRoom = require('./socket/dismissRoom');
const getPeople = require('./socket/getPeople');
const chatRouter = require('./routes/chatRoutes');
const wrtc = require('wrtc')
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io1 = new Server(server,{
  cors:{
    origin:'https://brosforlyf.onrender.com'
  },
  path:'/chat'
} )
const io2 = new Server(server,{
  cors:{
    origin:'https://brosforlyf.onrender.com'
  },
  path:'/voice'
} )
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/user', userRoute);
app.use('/api/post', postRoute);
app.use('/api/chat', chatRouter);
const rooms = {};
const chatLobby=[]
const chatRooms={}//id:[users(2)]

io1.on('connection', (socket) => {
  console.log('a user connected');
  socket.to('chatLobby').emit('reSync')
  
  //Chat Room events and their listeners
  socket.on('newUserOnline', async({roomName, nickname}) => {
    socket.emit('getUsersOnline',{nicknames:chatLobby})
  });
  socket.on('join room', ({roomName, userId,senderId, receiverId,sessionId}) => {
    if(roomName==='chatLobby' && !chatLobby.includes(userId)){
      chatLobby.push(userId)
      socket.join('chatLobby')
    }else{
      const splitArray = roomName.split(':')
    const leftSide = splitArray[0];
    const rightSide = splitArray[1];
    const inverse=`${rightSide}:${leftSide}`
      if (chatRooms[roomName]&&!chatRooms[roomName].includes(senderId)) {
        socket.join(roomName)
        chatRooms[roomName].push(senderId)
        
      }else if(chatRooms[inverse]&&!chatRooms[inverse].includes(senderId)){
        socket.join(inverse)
        chatRooms[inverse].push(senderId)
      
      }else{
        chatRooms[roomName] = [senderId];
        socket.join(roomName)
       
      }
      
    }
    
    //connectToRoom(io1,socket,nickname,roomName)
    
  });
  socket.on('outofRoom', ({roomName,userId}) => {
    disconnectFromRoom(socket,roomName)
    const userIdIndex = chatLobby.indexOf(userId);
    if (userIdIndex !== -1) {
      chatLobby.splice(userIdIndex, 1)
    } 
  });
  socket.on('sendMessage', ({roomName}) => {
    const splitArray = roomName.split(':')
    const leftSide = splitArray[0];
    const rightSide = splitArray[1];
    const inverse=`${rightSide}:${leftSide}`
      if (chatRooms[roomName]) {
        socket.to(roomName).emit('receivedMessage')
      }else if(chatRooms[inverse]){
        socket.to(inverse).emit('receivedMessage')
      }
    
  });
  socket.on('removeRoom', ({roomName}) => {
     
    const splitArray = roomName.split(':')
    const leftSide = splitArray[0];
    const rightSide = splitArray[1];
    const inverse=`${rightSide}:${leftSide}`
      if (chatRooms[roomName]) {
        dismissRoom(io1,roomName)
      }else if(chatRooms[inverse]){
        dismissRoom(io1,inverse)
      }
  });
  socket.on('typing', ({roomName}) => {
    const splitArray = roomName.split(':')
    const leftSide = splitArray[0];
    const rightSide = splitArray[1];
    const inverse=`${rightSide}:${leftSide}`
      if (chatRooms[roomName]) {
        socket.to(roomName).emit('userTyping')
      }else if(chatRooms[inverse]){
        socket.to(inverse).emit('userTyping')
      }
    
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.to('chatLobby').emit('reSync')
  });
});

io2.on('connection', (socket) => {
  //VoiceRoom events and their listeners
  // Join a room
  socket.on('join-voice', (roomId, userId) => {
    // Create the room if it does not exist
    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }

   
  //   const initiatorPeer = new SimplePeer({ initiator: true ,wrtc:wrtc});
  //   rooms[roomId] = { initiator: initiatorPeer, participants: {} };

  //   initiatorPeer.on('signal', (signal) => {
  //     socket.emit('signal', { userId, signal });
  //   });

  //   rooms[roomId].participants[userId] = initiatorPeer;
  // })
  //   socket.on('signal', ({ roomId, userId, signal }) => {
  //     if (rooms[roomId] && rooms[roomId].participants[userId]) {
  //       rooms[roomId].participants[userId].signal(signal);
  //     }
  //   });
    // Add the user to the room
    rooms[roomId][userId] = socket.id;

    // Join the socket.io room
    socket.join(roomId);
    // Broadcast to the other users in the room
    socket.to(roomId).emit('user-joined', userId);
    console.log('User ' + userId + ' joined room ' + roomId);
  });

  // Relay the signal data
  socket.on('signal', (data) => {
     console.log(rooms)
    // Find the socket id of the target user
    const socketId = rooms[data.roomId][data.targetId];
    // Emit the signal data to the target user
    io2.to(socketId).emit('signal', data);
  });

  // Leave a room
  socket.on('leave-voice', (roomId, userId) => {
    // Remove the user from the room
    delete rooms[roomId][userId];
    // Leave the socket.io room
    socket.leave(roomId);
    // Broadcast to the other users in the room
    socket.to(roomId).emit('user-left', userId);
    console.log('User ' + userId + ' left room ' + roomId);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected: ' + socket.id);
    // Find the room and the user that the socket belongs to
    for (const roomId in rooms) {
      for (const userId in rooms[roomId]) {
        if (rooms[roomId][userId] === socket.id) {
          // Remove the user from the room
          delete rooms[roomId][userId];
          // Leave the socket.io room
          socket.leave(roomId);
          // Broadcast to the other users in the room
          socket.to(roomId).emit('user-left', userId);
          console.log('User ' + userId + ' left room ' + roomId);
        }
      }
    }
  })
})

server.listen(process.env.PORT, () => {
  console.log(`Server/IO is up and running on port ${process.env.PORT}`);
});
