const disconnectFromRoom=(socket, roomName)=>{
          socket.leave(roomName);
        console.log(`Socket ${socket.id} left room: ${roomName}`);
      }

module.exports=disconnectFromRoom