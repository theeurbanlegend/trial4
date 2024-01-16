import React, { useContext, useState } from 'react';
import Navbar from './Navbar';
import Posts from './Posts';
import Sidebar from './Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { createContext } from 'react';
export const sidebarContext=createContext()
const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('HOME');
  

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <sidebarContext.Provider value={{isSidebarOpen,setSidebarOpen,selectedCategory,setSelectedCategory}}>
    <div className={`home `}>
      {isSidebarOpen && (
        <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Sidebar />
        </div>
      )}
      <div className="content">
        <Navbar />
        <button className="toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon title='Show Sidebar' icon={isSidebarOpen ? faArrowLeft : faArrowRight} />
        </button>
        <Posts />
      </div>
    </div>
    </sidebarContext.Provider>
  );
};

export default Home;
