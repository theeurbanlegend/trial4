// OtpForm.js
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpForm = () => {
  const [otp, setOtp] = useState('');
  const navigate= useNavigate()
  const email=localStorage.getItem('email')
  const handleInputChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit =async (e) => {
    const id=localStorage.getItem('id')
    

    e.preventDefault();
    if(!otp){
        return
    }
    const otpData={id,otp}
    try{
        await axios.post('https://api-brosforlyf.onrender.com/api/user/verify', otpData)
        .then((res)=>{
            setOtp('')
            navigate('/photo')
            if(localStorage.email)localStorage.removeItem('email')
        })
    }
    catch(err){
        console.log(err)
        
    }
  };

  return (
    <form className='otp-form' onSubmit={handleSubmit}>
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
      </div>
    </form>
  );
};

export default OtpForm;
