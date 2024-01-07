// Import the libraries

import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import {  Button, Input, Page, Spacer, Text, useToasts } from '@geist-ui/react';

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
const useUserMedia = () => {
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Request the user's audio stream
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setStream(stream);
        // Log when the microphone captures your voice
        console.log('Microphone is capturing your voice');
        
        // Add the event listener for the onactive event
        stream.addEventListener('active', () => {
          console.log('MediaStream is active');
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
      console.log(peersRef)
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
        const audio = document.getElementById('playback')
        console.log(audio)
        audio.srcObject = stream;
        audio.play();
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
        console.log(data)
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
            console.log(data)
          socket.emit('signal', {
            roomId: roomId,
            targetId: data.userId,
            data: data,
          });
        });
        // Play the remote audio stream
        peer.on('stream', (stream) => {
            console.log(stream)
            const audio = document.getElementById('playback')
            console.log(audio)
          audio.srcObject = stream;
          audio.play();

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
      socket.off('signal', handleSignal);
    };
  }, [roomId, userId, stream, socket]);

  return peersRef;
};

// Define the main component
const VoiceRoom = () => {
  // Define the state variables
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);

  // Define the custom hooks
  const userId = useUserId();
  const stream = useUserMedia();
  const socket = useRef(io('http://localhost:3001',{path:'/voice'})).current;
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
      <audio id='playback'> <source/></audio> */
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
