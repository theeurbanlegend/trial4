import { faComments, faCommentsDollar, faFutbol, faGamepad, faImage, faMusic } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react'

const Splashpage = () => {
  const [actions, setActions] = useState(["share", 'chat', 'huddle']);
  const [currentAction, setCurrentAction] = useState(actions[0]);
  const year=new Date().getFullYear()

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Find the index of the current action
      const currentIndex = actions.indexOf(currentAction);

      // Calculate the next index
      const nextIndex = (currentIndex + 1) % actions.length;

      // Set the current action to the next one in the array
      setCurrentAction(actions[nextIndex]);
    }, 3000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [actions, currentAction]);
  return (
    <div >
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'40px' }}>
      <h1 style={{width:'100%'}}>Welcome to the first edition of the Bros 4 Lyf space.
       Where you can <span className="fade-in-out">
             {currentAction} 
          </span> with your fellow comrades.</h1>
      </div>  
    <h3 style={{paddingLeft:'10px'}}>Get to know what your comrades have to say about: </h3>
    <ul className='landing-grid'>
      <li className='landing-item'>
        <FontAwesomeIcon className='landing-item-icon' icon={faFutbol}/>
        <p>From the hardcore fans of Football eg Afcon, Serie A, Laliga, Bundesliga, BasketBall</p>
      </li>
      <li className='landing-item'>
        <FontAwesomeIcon className='landing-item-icon' icon={faGamepad} />
        <p>Be in the moment as you watch uploaded or livestreams of loved multiplayer Games like Fortnite, FIFA and many more action packed games </p>
      </li>
      <li className='landing-item'>
        <FontAwesomeIcon className='landing-item-icon'  icon={faComments}/>
        <p>Chat with your friends in real-time like Whatsapp and know their feelings and thoughts about what you would like to share. </p>
      </li>
      <li className='landing-item'>
        <FontAwesomeIcon className='landing-item-icon' icon={faMusic}/>
        <p> Endluge yourself in mind blowing playlists that your fellow comrades post or do so to rival their tastes!</p>
      </li>
      <li className='landing-item'>
        <FontAwesomeIcon className='landing-item-icon' icon={faImage}/>
        <p>Share memorable H class moments to strengthen the comrade-bond including pictures, cool selfies and videos.</p>
      </li>
      
    </ul>
    </div>
    
  )
}

export default Splashpage