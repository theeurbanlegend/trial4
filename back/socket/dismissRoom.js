const dismissRoom = (io, roomName) => {
  // Check if the room exists before attempting to delete it
  if (io.sockets.adapter.rooms.has(roomName)) {
    console.log(`Room '${roomName}' found`);

    // Iterate through all sockets in the room and disconnect them
    io.sockets.adapter.rooms.get(roomName).forEach((socketId) => {
      console.log(socketId)
      // Delete the room
    io.sockets.adapter.del(socketId,roomName)
    console.log(`Room '${roomName}' dismissed`);
      //io.sockets.sockets[socketId].disconnect(true);
    })
  } else {
    console.log(`Room '${roomName}' not found`);
  }
};

module.exports = dismissRoom;
