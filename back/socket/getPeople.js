const getPeople=async (io, roomName)=>{
// Get the number of clients in a room
const numClients = io.sockets.adapter.rooms.get(roomName)?.size ?? 0;
console.log(numClients)
// Get an array of socket IDs currently available in the given room
const clients =await io.in(roomName).fetchSockets();
// Get an array of nicknames of clients currently available in the given room
const nicknames = clients.map(client => client.nickname);
return nicknames
}

module.exports=getPeople