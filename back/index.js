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
const disconnectFromRoom = require('./socket/disconnectFromRoom');
const dismissRoom = require('./socket/dismissRoom');
const getPeople = require('./socket/getPeople');
const chatRouter = require('./routes/chatRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io1 = new Server(server,{
  cors:{
    origin:'http://localhost:5173'
  },
  path:'/chat'
} )
const io2 = new Server(server,{
  cors:{
    origin:'http://localhost:5173'
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


io1.on('connection', (socket) => {
  console.log('a user connected');
  socket.to('chatLobby').emit('reSync')
  
  //Chat Room events and their listeners
  socket.on('newUserOnline', async({roomName, nickname}) => {
    const nicknames=await getPeople(io1,roomName)
    socket.emit('getUsersOnline',{nicknames:nicknames})
  });
  socket.on('join room', ({roomName, nickname}) => {
    connectToRoom(io1,socket,nickname,roomName)
    
  });
  socket.on('outofRoom', ({roomName}) => {
    disconnectFromRoom(socket,roomName)

  });
  socket.on('sendMessage', ({roomName}) => {
    socket.to(roomName).emit('receivedMessage')
  });
  socket.on('getmembers', ({roomName}) => {
    getPeople(io1,roomName)
  });
  socket.on('removeRoom', ({roomName}) => {
    dismissRoom(io1,roomName)
  });
  socket.on('typing', () => {
    socket.to('chat').emit('userTyping')
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
    // Find the socket id of the target user
    const socketId = rooms[data.roomId][data.targetId];
    // Emit the signal data to the target user
    io1.to(socketId).emit('signal', data);
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
