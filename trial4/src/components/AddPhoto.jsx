// ProfilePhotoForm.js
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePhotoForm = ({ onSkip, onSave }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const navigate=useNavigate()

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewURL(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      setSelectedPhoto(null);
      setPreviewURL(null);
    }
  };

  const handleSkip = () => {
    navigate('/')
  };

  const handleSave = async() => {
    const id=localStorage.getItem('id')
    const formData = new FormData();
    formData.append('id', id); // Replace with actual username
    formData.append('photo', selectedPhoto);
    try{
        await axios.post('https://api-brosforlyf.onrender.com/api/user/add', formData)
        .then((res)=>{
            console.log(res)
            navigate('/home')
        })
    }
    catch(err){
        console.log(err)
        
    }
  };

  return (
    <div className="profile-photo-form">
      <label htmlFor="profile-photo">Choose Profile Photo:</label>
      <input
        type="file"
        id="profile-photo"
        name="profilePhoto"
        accept="image/*"
        onChange={handlePhotoChange}
      />
      {previewURL && (
        <div className="photo-preview">
          <img src={previewURL} alt="Preview" />
        </div>
      )}
      <div className="button-container">
        <button onClick={handleSkip}>Skip</button>
        <button onClick={handleSave} disabled={!selectedPhoto}>
          Save
        </button>
      </div>
    </div>
  );
};

export default ProfilePhotoForm;
