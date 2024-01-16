import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import OtpOverlay from './OTPOverlay';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UserProfile = () => {
  const [user, setUser] = useState({ fullname: '', currentEmail: '', username: '' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewURL, setPreviewURL] = useState(null)
  const { id } = useParams();
  const navigate = useNavigate();
  const [editPhotoMode, setEditPhotoMode] = useState(false);
  const [editEmailMode, setEditEmailMode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [profilePhotoId, setProfilePhotoId] = useState('');
  const [currentPhotoId, setCurrentPhotoId] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false); // State to control OTP form visibility
  const [newProfilePicture, setNewProfilePicture] = useState(null);

  useEffect(() => {
    // Fetch user data from the server
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://api-brosforlyf.onrender.com/api/user/current/${id}`);
        const userData = response.data.user;
        setUser(userData);
        setProfilePhotoId(userData.photo.filename);
        setCurrentPhotoId(userData.photo.filename);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id]); // Dependency on id to re-fetch data when id changes

  const toggleEditMode = () => {
    setEditEmailMode(!editEmailMode);
    setEditPhotoMode(!editPhotoMode);
  };

  const handleSave = async () => {
    // If a new profile picture is selected, upload it first
    if (editPhotoMode) {
      const formData = new FormData();
      formData.append('photo', selectedPhoto);
      formData.append('id', id);
      formData.append('currentPhotoId', currentPhotoId);
      try {
        const uploadResponse = await axios.post('https://api-brosforlyf.onrender.com/api/user/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        // Update the profile photo id in the state
        setProfilePhotoId(uploadResponse.data.id);
        setCurrentPhotoId(uploadResponse.data.id);
        setEditPhotoMode(false)
      } catch (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        // Handle the error (show a message, etc.)
        return;
      }
    }

    // Perform save operation (update the user's email)
    try {
      if(editEmailMode){
      const response = await axios.post('https://api-brosforlyf.onrender.com/api/user/update', {
        username: user.username,
        oldemail: user.currentEmail,
        newemail: newEmail,
      });

      // If the server requires OTP verification, show the OTP form
      if (response.data.msg === 'Awaiting OTP verification') {
        setShowOtpForm(true);
      } else {
        // Update the user's email in the state
        setUser((prevUser) => ({
          ...prevUser,
          currentEmail: newEmail,
        }));

        // Disable edit mode after saving
        setEditEmailMode(false);
      }
    }
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  // Handle OTP form submission
  const handleOtpSubmit = async (otp) => {
    try {
      // Send OTP to the server for verification
      const response = await axios.post('https://api-brosforlyf.onrender.com/api/user/verify', {
        otp,
        id,
      });

      // OTP verification successful
      if (response.data.msg === 'OTP verification successful!') {
        // Update the user's email in the state
        setUser((prevUser) => ({
          ...prevUser,
          currentEmail: newEmail,
        }));

        // Disable edit mode and hide OTP form after saving
        setEditEmailMode(false);
        setShowOtpForm(false);
      } else {
        // OTP verification failed, handle accordingly (e.g., show error message)
        console.error('OTP verification failed');
        // Optionally, you can show an error message to the user
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setSelectedPhoto(selectedFile);
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };

      reader.readAsDataURL(selectedFile);
    } else {
      setSelectedPhoto(null);
      setPreviewURL(null);
    }
    setNewProfilePicture(selectedFile);
  };

  return (
    <div className="user-profile">
      <button style={{ position: 'absolute', top: 0, left: 0, marginLeft: '2px', marginTop: '2px' }} onClick={() => navigate('/home')}><FontAwesomeIcon icon={faArrowLeft} /></button>
      <div className="profile-header">
      {!previewURL &&(
        <div className="profile-photo" onClick={()=>setEditPhotoMode(true)}>
          <img src={`https://api-brosforlyf.onrender.com/api/user/photo/${profilePhotoId}`} alt="Profile" />
          <div className="over-lay">
            <span>Change Pic</span>
          </div>
        </div>)}
        {previewURL && (
        <div className="profile-photo">
          <img src={previewURL} alt="Preview" />
        </div>
      )}
        {editPhotoMode && (
          <div>
            <label htmlFor="profilePicture">Select a new profile picture:</label>
            <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} />
          </div>
        )}
      </div>
      <div className="profile-details">
        <div className="user-name">{user.fullname}</div>
        <div className="user-info">
          {editEmailMode ? (
            <>
              <label htmlFor='newEmail'>New Email:</label>
              <input
                type="text"
                id='newEmail'
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </>
          ) : (
            <div className="info-value">{user.currentEmail}</div>
          )}
        </div>
        <div className="user-info">
          <div className="info-value">{user.username}</div>
        </div>
      </div>
      <div className="profile-actions">
        {editPhotoMode||editEmailMode ? (
          <>
          <button style={{marginRight:'10px'}} onClick={handleSave}>Save</button>
          <button onClick={toggleEditMode}>Cancel</button>
          </>
          
        ) : (
          <button style={{ position: 'absolute', bottom: 0, right: 0, marginRight: '2px', marginBottom: '2px' }} onClick={toggleEditMode}>Edit</button>
        )}
      </div>

      {showOtpForm && (
        <OtpOverlay
          email={newEmail}
          onClose={() => setShowOtpForm(false)} // Provide a way to close the OTP form
          onSubmit={handleOtpSubmit} // Pass the OTP form submission handler
        />
      )}
    </div>
  );
};

export default UserProfile;
