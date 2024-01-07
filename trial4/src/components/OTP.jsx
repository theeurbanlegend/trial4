// OtpForm.js
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpForm = () => {
  const [otp, setOtp] = useState('');
  const navigate= useNavigate()

  const handleInputChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit =async (e) => {
    const id=localStorage.getItem('id')
    console.log(id)

    e.preventDefault();
    if(!otp){
        return
    }
    const otpData={id,otp}
    try{
        await axios.post('https://api-brosforlyf.onrender.com/api/user/verify', otpData)
        .then((res)=>{
            console.log("Res: ",res)
            setOtp('')
            navigate('/photo')
        })
    }
    catch(err){
        console.log(err)
        
    }
  };

  return (
    <form className='otp-form' onSubmit={handleSubmit}>
      <div className="otp-group">
        <label htmlFor="otp">Enter OTP:</label>
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
