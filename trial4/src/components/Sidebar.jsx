import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faCog, faMusic, faHeadphones, faPhotoVideo, faVideo, faFutbolBall, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { sidebarContext } from './Home';

const Sidebar = () => {
    const {setSelectedCategory}=useContext(sidebarContext)
  return (
    <>
    <h1 style={{marginBottom:'30px'}}>BROS FOR LYF</h1>
    <div className="sidebar" >
      <div className="sidebar-item" onClick={()=>setSelectedCategory('HOME')} >
        <FontAwesomeIcon style={{marginRight:'6px'}} icon={faHome} />
        <span>Home</span>
      </div>
      <div className="sidebar-item" onClick={()=>setSelectedCategory('MUSIC')}>
        <FontAwesomeIcon style={{marginRight:'6px'}} icon={faMusic} />
        <span>Music</span>
      </div>
      <div className="sidebar-item" onClick={()=>setSelectedCategory('GAMES')}>
        <FontAwesomeIcon style={{marginRight:'6px'}} icon={faGamepad} />
        <span>Games</span>
      </div>
      <div className="sidebar-item" onClick={()=>setSelectedCategory('VIDEOS')}>
        <FontAwesomeIcon style={{marginRight:'6px'}} icon={faVideo} />
        <span>Videos</span>
      </div>
      <div className="sidebar-item" onClick={()=>setSelectedCategory('MOMENTS')}>
        <FontAwesomeIcon style={{marginRight:'6px'}} icon={faPhotoVideo} />
        <span>Moments</span>
      </div>
      <div className="sidebar-item" onClick={()=>setSelectedCategory('SPORTS')}>
        <FontAwesomeIcon style={{marginRight:'6px'}} icon={faFutbolBall} />
        <span>Sports</span>
      </div>
    </div>
    </>
  );
}

export default Sidebar;
