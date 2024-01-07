const connectToRoom = async(io,socket,nickname, roomName) => {
  socket.nickname = nickname;
  const room = io.sockets.adapter.rooms.get(roomName)
  const maxPeople=2
  if(!room){
    socket.join(roomName);
    console.log(socket.rooms)
    console.log(`Socket ${socket.id} joined room: ${roomName}`);
  }
  const roomCheck = io.sockets.adapter.rooms.get(roomName)
  if(roomName=='chatLobby'){
    socket.join(roomName)
    return
  }
  console.log('Room Checking:',roomName, roomCheck.size)
  if(roomName!='chatLobby' && roomCheck.size<=maxPeople){
    const clients =await io.in(roomName).fetchSockets();
    const nicknames = clients.map(client => client.nickname);
    console.log(nicknames)
    socket.join(roomName);
    }else{
      console.log('Room Full!')
    }
  
  };
  
module.exports =connectToRoom;
  