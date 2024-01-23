// // Import the libraries

// import React, { useEffect, useRef, useState } from 'react';
// import SimplePeer from 'simple-peer';
// import io from 'socket.io-client';
// import { Button, Input, Page, Spacer, Text, useToasts } from '@geist-ui/react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { useNavigate } from 'react-router-dom';

// // Define a custom hook to generate a random user id
// const useUserId = () => {
//   const [userId, setUserId] = useState('');

//   useEffect(() => {
//     // Generate a random user id
//     const id = Math.random().toString(36).substr(2, 9);
//     setUserId(id);
//   }, []);

//   return userId;
// };

// // Define a custom hook to get the user's audio stream
// const useUserMedia = () => {
//     const [stream, setStream] = useState(null);
  
//     useEffect(() => {
//      navigator.mediaDevices.getUserMedia({ video:false,audio: true })
//           .then((stream)=>{
//             console.log(stream)
//             setStream
//               // Log when the microphone captures your voice
//               console.log('Microphone is capturing your voice');
//             }
//           )
  
//     }, []);
  
//     return stream;
//   };
// // Define a custom hook to create and manage peer connections
// const usePeers = (roomId, userId, stream, socket) => {
//   // Define an object to store the peer connections
//   const peersRef = useRef({});

//   useEffect(() => {
//     // Handle the user-joined event
    
//     const handleUserJoined = (userId) => {
//       // Create a new peer connection
//       const peer = new SimplePeer({
//         initiator: true,
//         stream: stream,
//       });
      
//       // Add the peer to the peers object
//       peersRef.current[userId] = peer;
//       // Send the signal data to the server
//       peer.on('signal', (data) => {
//         socket.emit('signal', {
//           roomId: roomId,
//           targetId: userId,
//           data: data,
//         });
//       });

//       // Play the remote audio stream
//       peer.on('stream', (stream) => {
//         console.log('Streaming 2!',stream)
//         //const audio = document.createElement('audio')
//         const audio = document.getElementById('playback1')
//         //document.body.appendChild(audio);
//         audio.srcObject = stream;
//         audio.onloadedmetadata = (e) => {
//             console.log('loaded')
//             audio.muted = false;
//             audio.play();
            
//           };
//       });
//       // Handle the peer connection error
//       peer.on('error', (error) => {
//         console.error(error);
//       });
//     };

//     // Handle the user-left event
//     const handleUserLeft = (userId) => {
//       // Destroy the peer connection
//       const peer = peersRef.current[userId];
//       if (peer) {
//         console.log('dismissed channel')
//         peer.destroy();
//       }
//       // Remove the peer from the peers object
//       delete peersRef.current[userId];
//     };

//     // Handle the signal event
//     const handleSignal = (data) => {
//       // Find the peer connection
//       const peer = peersRef.current[data.userId];
//       if (peer) {
//         // Signal the peer with the data
//         peer.signal(data.data);
//       } else {
//         // Create a new peer connection
//         const peer = new SimplePeer({
//           initiator: false,
//           stream: stream,
//         });
//         // Add the peer to the peers object
//         peersRef.current[data.userId] = peer;
//         // Signal the peer with the data
//         peer.signal(data.data);
//         // Send the signal data to the server
//         peer.on('signal', (data) => {
//           socket.emit('signal', {
//             roomId: roomId,
//             targetId: data.userId,
//             data: data,
//           });
//         });
//         // Play the remote audio stream
//         peer.on('stream', (stream) => {
//             console.log("Streaming 1",stream)
//             const audio = document.getElementById('playback2')
//           audio.srcObject = stream;
//           audio.onloadedmetadata = (e) => {
//             console.log('loaded!')
//             audio.muted = false;
//             audio.play();
//           };
//         });
//         // Handle the peer connection error
//         peer.on('error', (error) => {
//           console.error(error);
//         });
//       }
//     };

//     // Listen to the socket.io events
//     socket.on('user-joined', handleUserJoined);
//     socket.on('user-left', handleUserLeft);
//     socket.on('signal', handleSignal);

//     // Clean up the socket.io listeners
//     return () => {
//       socket.off('user-joined', handleUserJoined);
//       socket.off('user-left', handleUserLeft);
//       socket.off('signal',handleSignal);
//     };
//   }, [roomId, userId, stream, socket]);

//   return peersRef;
// };

// // Define the main component
// const VoiceRoom = () => {
//   // Define the state variables
//   const [roomId, setRoomId] = useState('');
//   const [joined, setJoined] = useState(false);
//   const navigate= useNavigate()
//   //const audio = document.getElementById('playback1')
//   // Define the custom hooks
//   const userId = useUserId();
// const userAudio = useRef(); 
//   const stream = useUserMedia();
//   //const socket = useRef(io('http://localhost:3001',{path:'/voice'})).current;
//   const socket = useRef(io('ws://localhost:3001',{path:'/voice'})).current;
//   const peersRef = usePeers(roomId, userId, stream, socket);
//   const [,setToast] = useToasts();
  

//   // Define the event handlers
//   const handleRoomIdChange = (event) => {
//     setRoomId(event.target.value);
//   };

//   const handleJoinRoom = () => {
//     // Check if the room id is valid
//     if (roomId) {
//       // Join the room
//       socket.emit('join-voice', roomId, userId);
//       setJoined(true);
//       setToast({ text: 'Joined the room: ' + roomId, delay:2000});
//     } else {
//       setToast({ text: 'Please enter a valid room id', type: 'error',delay:2000 });
//     }
//   };

//   const handleLeaveRoom = () => {
//     // Leave the room
//     socket.emit('leave-voice', roomId, userId);
//     setJoined(false);
//     setToast({ text: 'Left the room: ' + roomId,delay:2000});
//     // Destroy all the peer connections
//     for (const peer of Object.values(peersRef.current)) {
//       peer.destroy();
//     }
//     // Clear the peers object
//     peersRef.current = {};
//   };

//   // Render the component
//   return (
//     <Page>
//       <FontAwesomeIcon style={{ position: 'absolute', top: 0, left: 0, marginLeft: '2px', marginTop: '2px' }} onClick={() => navigate('/home')} icon={faArrowLeft} />
//       <Text i>This feature is still under development so it still doesn't work!</Text>
//       <Text h1>Simple Voice Room</Text>
//       <Text p>User ID: {userId}</Text>
//       <audio ref={userAudio} hidden autoPlay id='playback1'></audio>
//       <audio ref={userAudio} hidden autoPlay id='playback2'></audio>
      
//       <Spacer />
//       {joined ? (
//         <Button type="error" onClick={handleLeaveRoom}>
//           Leave Room
//         </Button>
//       ) : (
//         <div>
//           <Input
//             value={roomId}
//             onChange={handleRoomIdChange}
//             placeholder="Enter a room id"
//           />
//           <Spacer />
//           <Button type="success" onClick={handleJoinRoom}>
//             Join Room
//           </Button>
//         </div>
//       )}
//     </Page>
//   );
// };

// export default VoiceRoom;
import { Button, Input, Page, Spacer, Text, useToasts } from '@geist-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft ,faPhone } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useRef, useState } from "react"

import Peer from "simple-peer"
import io from "socket.io-client"


const socket = io('https://api-brosforlyf.onrender.com',{path:'/voice'})
function VoiceRoom() {
	const [ me, setMe ] = useState("")
	const [ stream, setStream ] = useState()
	const [ receivingCall, setReceivingCall ] = useState(false)
	const [ caller, setCaller ] = useState("")
	const [ callerSignal, setCallerSignal ] = useState()
	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ idToCall, setIdToCall ] = useState("")
	const [ callEnded, setCallEnded] = useState(false)
	const [ name, setName ] = useState("")
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef= useRef()

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
				myVideo.current.srcObject = stream
		})

	socket.on("me", (id) => {
			setMe(id)
		})

		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
	}, [])

	const callUser = (id) => {
    console.log(id)
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {
			
				userVideo.current.srcObject = stream
			
		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}

	const answerCall =() =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}

	return (
		<>
			<h1 style={{ textAlign: "center", color: 'black' }}>Zoomish</h1>
		<div className="container">
			<div className="video-container">
				<div className="video">
					{stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
				</div>
				<div className="video">
					{callAccepted && !callEnded ?
					<video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />:
					null}
				</div>
			</div>
			<div className="myId">
				<Input
					id="filled-basic"
					label="My Id"
					
					value={me}
					onChange={(e) => setName(e.target.value)}
					style={{ marginBottom: "20px" }}
				/>
				<Input
					id="filled-basic"
					label="ID to call"
					value={idToCall}
					onChange={(e) => setIdToCall(e.target.value)}
				/>
				<div className="call-button">
					{callAccepted && !callEnded ? (
						<Button variant="contained" color="secondary" onClick={leaveCall}>
							End Call
						</Button>
					) : (
						<FontAwesomeIcon style={{cursor:'pointer'}} icon={faPhone} color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
						
						</FontAwesomeIcon>
					)}
					{idToCall}
				</div>
			</div>
			<div>
				{receivingCall && !callAccepted ? (
						<div className="caller">
						<h1 >{name} is calling...</h1>
						<Button variant="contained" color="primary" onClick={answerCall}>
							Answer
						</Button>
					</div>
				) : null}
			</div>
		</div>
		</>
	)
}

export default VoiceRoom
