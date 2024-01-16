// Import the libraries

import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import { Button, Input, Page, Spacer, Text, useToasts } from '@geist-ui/react';

// Define a custom hook to generate a random user id
const useUserId = () => {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Generate a random user id
    const id = Math.random().toString(36).substr(2, 9);
    setUserId(id);
  }, []);

  return userId;
};

// Define a custom hook to get the user's audio stream
const useUserMedia = (audio) => {
    const [stream, setStream] = useState(null);
  
    useEffect(() => {
      const getStream = async () => {
        try {
          // Request the user's audio stream
          await navigator.mediaDevices.getUserMedia({ audio: true })
          .then(async(stream)=>{
            const userMediaStream=stream
            console.log(stream)
            if (userMediaStream) {
              setStream(userMediaStream);
              audio.srcObject = userMediaStream;
              
              // Wait for the audio to be loaded and play it
              await new Promise((resolve) => {
                  setStream(userMediaStream)
                audio.onloadedmetadata = (e) => {
  
                  audio.play();
                  audio.muted = false;
                  resolve(userMediaStream);
                };
              });
    
              // Log when the microphone captures your voice
              console.log('Microphone is capturing your voice');
            }
          })
  
          
        } catch (error) {
          console.error(error);
        }
      };
  
      getStream();
    }, [audio]);
  
    return stream;
  };
// Define a custom hook to create and manage peer connections
const usePeers = (roomId, userId, stream, socket) => {
  // Define an object to store the peer connections
  const peersRef = useRef({});

  useEffect(() => {
    // Handle the user-joined event
    
    const handleUserJoined = (userId) => {
      // Create a new peer connection
      const peer = new SimplePeer({
        initiator: true,
        stream: stream,
      });
      
      // Add the peer to the peers object
      peersRef.current[userId] = peer;
      // Send the signal data to the server
      peer.on('signal', (data) => {
        socket.emit('signal', {
          roomId: roomId,
          targetId: userId,
          data: data,
        });
      });

      // Play the remote audio stream
      peer.on('stream', (stream) => {
        console.log('Streaming 2!',stream)
        //const audio = document.createElement('audio')
        const audio = document.getElementById('playback1')
        //document.body.appendChild(audio);
        audio.srcObject = stream;
        audio.onloadedmetadata = (e) => {
            console.log('loaded')
            audio.muted = false;
            audio.play();
            
          };
      });
      // Handle the peer connection error
      peer.on('error', (error) => {
        console.error(error);
      });
    };

    // Handle the user-left event
    const handleUserLeft = (userId) => {
      // Destroy the peer connection
      const peer = peersRef.current[userId];
      if (peer) {
        console.log('dismissed channel')
        peer.destroy();
      }
      // Remove the peer from the peers object
      delete peersRef.current[userId];
    };

    // Handle the signal event
    const handleSignal = (data) => {
      // Find the peer connection
      const peer = peersRef.current[data.userId];
      if (peer) {
        // Signal the peer with the data
        peer.signal(data.data);
      } else {
        // Create a new peer connection
        const peer = new SimplePeer({
          initiator: false,
          stream: stream,
        });
        // Add the peer to the peers object
        peersRef.current[data.userId] = peer;
        // Signal the peer with the data
        peer.signal(data.data);
        // Send the signal data to the server
        peer.on('signal', (data) => {
          socket.emit('signal', {
            roomId: roomId,
            targetId: data.userId,
            data: data,
          });
        });
        // Play the remote audio stream
        peer.on('stream', (stream) => {
            console.log("Streaming 1",stream)
            const audio = document.getElementById('playback2')
          audio.srcObject = stream;
          audio.onloadedmetadata = (e) => {
            console.log('loaded!')
            audio.muted = false;
            audio.play();
          };
        });
        // Handle the peer connection error
        peer.on('error', (error) => {
          console.error(error);
        });
      }
    };

    // Listen to the socket.io events
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('signal', handleSignal);

    // Clean up the socket.io listeners
    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('signal',handleSignal);
    };
  }, [roomId, userId, stream, socket]);

  return peersRef;
};

// Define the main component
const VoiceRoom = () => {
  // Define the state variables
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  //const audio = document.getElementById('playback')
  // Define the custom hooks
  const userId = useUserId();
const userAudio = useRef(); 
  const stream = useUserMedia();
  const socket = useRef(io('https://api-brosforlyf.onrender.com',{path:'/voice'})).current;
  const peersRef = usePeers(roomId, userId, stream, socket);
  const [,setToast] = useToasts();
  

  // Define the event handlers
  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  const handleJoinRoom = () => {
    // Check if the room id is valid
    if (roomId) {
      // Join the room
      socket.emit('join-voice', roomId, userId);
      setJoined(true);
      setToast({ text: 'Joined the room: ' + roomId, delay:2000});
    } else {
      setToast({ text: 'Please enter a valid room id', type: 'error',delay:2000 });
    }
  };

  const handleLeaveRoom = () => {
    // Leave the room
    socket.emit('leave-voice', roomId, userId);
    setJoined(false);
    setToast({ text: 'Left the room: ' + roomId,delay:2000});
    // Destroy all the peer connections
    for (const peer of Object.values(peersRef.current)) {
      peer.destroy();
    }
    // Clear the peers object
    peersRef.current = {};
  };

  // Render the component
  return (
    <Page>
      <Text h1>Simple Voice Room</Text>
      <Text p>User ID: {userId}</Text>
      <audio ref={userAudio} hidden autoPlay id='playback1'></audio>
      <audio ref={userAudio} hidden autoPlay id='playback2'></audio>
      
      <Spacer />
      {joined ? (
        <Button type="error" onClick={handleLeaveRoom}>
          Leave Room
        </Button>
      ) : (
        <div>
          <Input
            value={roomId}
            onChange={handleRoomIdChange}
            placeholder="Enter a room id"
          />
          <Spacer />
          <Button type="success" onClick={handleJoinRoom}>
            Join Room
          </Button>
        </div>
      )}
    </Page>
  );
};

export default VoiceRoom;
