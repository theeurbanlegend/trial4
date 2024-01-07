// OtpOverlay.js
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpOverlay = ({ email, onClose, onSubmit }) => {
  const [otp, setOtp] = useState('')

  const handleInputChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      return;
    }
    try {
      // Call the onSubmit function passed as a prop
      await onSubmit(otp);
      setOtp('');
    } catch (err) {
      console.log(err);
      // Handle error, e.g., display an error message
    }
  };

  return (
    <div className="overlay">
      <form className="otp-form" onSubmit={handleSubmit}>
        <div className="otp-group">
          <label htmlFor="otp">Enter OTP sent to {email}:</label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={otp}
            onChange={handleInputChange}
            maxLength="6"
            required
          />
        </div>
        <div className="otp-actions">
          <button type="submit">Submit OTP</button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default OtpOverlay;
