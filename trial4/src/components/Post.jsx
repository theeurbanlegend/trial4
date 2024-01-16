import React, { useEffect, useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import videojs from 'video.js';
import axios from 'axios';
import 'video.js/dist/video-js.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

const Post = ({ id, vidId, datePosted, posterId, subjectSummary, imageUrl ,likes,liked}) => {
  const [timeAgo, setTimeAgo] = useState('');
  const [poster, setPoster] = useState('');
  const [posterprofile, setPosterprofile] = useState('');
  const [isLiked, setIsLiked] = useState(liked);
  const [likesNo, setLikesNo] = useState(likes);
  const userId=localStorage.getItem("id")
  const url = 'https://api-brosforlyf.onrender.com';
  
  const handleLike=async()=>{
   if(isLiked){
    await axios.post(`${url}/api/post/unlike/${id}`,{userId})
    .then((res)=>{
      if(res.data.likes){
        setLikesNo(res.data.likes.length)
        setIsLiked(false)
      }
    })
    
  }else{
    await axios.post(`${url}/api/post/like/${id}`,{userId})
    .then((res)=>{
      if(res.data.likes){
        setLikesNo(res.data.likes.length)
        setIsLiked(true)
      }
    })
    
  }
  }
  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const postedTime = new Date(datePosted);
      const timeDifference = now - postedTime;

      // Convert milliseconds to seconds
      const seconds = Math.floor(timeDifference / 1000);

      if (seconds < 60) {
        setTimeAgo('a few seconds ago');
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes} min${minutes > 1 ? 's' : ''} ago`);
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`${hours} hr${hours > 1 ? 's' : ''} ago`);
      } else {
        const days = Math.floor(seconds / 86400);
        setTimeAgo(`${days} day${days > 1 ? 's' : ''} ago`);
      }
    };
    const getPoster = async () => {
      await axios.get(`https://api-brosforlyf.onrender.com/api/user/current/${posterId}`).then((res) => {
        setPoster(res.data.user.username);
        setPosterprofile(res.data.user.photo.filename)
      });
    };
    getPoster();
    calculateTimeAgo();

    // Refresh the time difference every minute
    const intervalId = setInterval(calculateTimeAgo, 60000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [datePosted]);

  const isVideo = imageUrl && imageUrl.filename.match(/\.(mp4|webm|ogg|m4a|mkv)$/);
  const isAudio = imageUrl && imageUrl.filename.match(/\.(mp3|wav|ogg)$/);

  useEffect(() => {
    // Initialize video.js for video elements
    if (isVideo) {
      const videoNode = document.createElement('video');
      const newVidID = document.createAttribute('id');
      newVidID.value = `video-${vidId}`;
      videoNode.setAttributeNode(newVidID);
      const player = videojs(videoNode);
      return () => {
        if (player) {
          player.dispose();
        }
      };
    }
  }, [id, isVideo]);

  return (
    <div className="post">
      <div className="post-header-profile">
        <div><img
          loading="lazy"
          src={`${url}/api/user/photo/${posterprofile}`}
          className="post-header-profile-photo"
        /></div>
        <div className='post-author-details'>
          <div className="post-author">{poster}</div>
          <div style={{fontSize:'10px'}}>{timeAgo}</div>
          </div>
      </div>
      <div style={{ margin:'10px', textAlign:'start'}}>{subjectSummary}</div>
      <div className="post-content">
        
        {isVideo ? (
          <video
            id={`video-${vidId}`}
            className="video-js vjs-default-skin"
            controls
            autoPlay={false}
            width="100%"
            data-setup="{}"
          >
            <source src={`${url}/api/post/image/${imageUrl.filename}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : isAudio ? (
          <div className="audio-container">
            <ReactAudioPlayer
              src={`${url}/api/post/image/${imageUrl.filename}`}
              autoPlay={false}
              controls
              className="react-audio-player"
            />
          </div>
        ) : <img
        loading="lazy"
        src={`${url}/api/post/image/${imageUrl.filename}`}
        alt={`Post ${vidId}`}
        className="post-image"
      />}
      </div>
      <br/>
      <div style={{marginLeft:'5px'}}><FontAwesomeIcon style={{marginLeft:'5px',cursor:'pointer',color:isLiked?`blue`:'black'}} onClick={handleLike} icon={faThumbsUp}/><span style={{marginLeft:'5px'}}>{likesNo}</span> likes</div>
      
    </div>
  );
};

export default Post;
