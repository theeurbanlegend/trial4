// OtpForm.js
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OtpForm = () => {
  const [otp1, setOtp1] = useState('');
  const [otp2, setOtp2] = useState('');
  const [otp3, setOtp3] = useState('');
  const [otp4, setOtp4] = useState('');
  const [otp5, setOtp5] = useState('');
  const [otp6, setOtp6] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  useEffect(() => {
    const handleInputBarChange = (e) => {
      const { value, name } = e.target;
    
      if (value.length === 0) {
        // Focus on the previous input when the value is deleted
        const previousInput = document.getElementById(`otp${parseInt(name[name.length - 1], 10) - 1}`);
        if (previousInput) {
          previousInput.focus();
        }
      } else if (value && value.length === 1) {
        // Focus on the next input when a character is entered
        const nextInput = document.getElementById(`otp${parseInt(name[name.length - 1], 10) + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    };
    

    // Attach the event listener to all OTP input bars
    document.querySelectorAll('.otp-inputbar').forEach((inputBar) => {
      inputBar.addEventListener('keyup', handleInputBarChange)
    });

    // Cleanup the event listeners when the component unmounts
    return () => {
      document.querySelectorAll('.otp-inputbar').forEach((inputBar) => {
        inputBar.removeEventListener('keyup', handleInputBarChange);
        inputBar.removeEventListener('keydown', handleInputBarChange);
        inputBar.removeEventListener('keypress', handleInputBarChange);
      });
    };
  }, []); // Empty dependency array to ensure the effect runs only once on mount

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'otp1':
        setOtp1(value);
        break;
      case 'otp2':
        setOtp2(value);
        break;
      case 'otp3':
        setOtp3(value);
        break;
      case 'otp4':
        setOtp4(value);
        break;
      case 'otp5':
        setOtp5(value);
        break;
      case 'otp6':
        setOtp6(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = localStorage.getItem('id');
    const otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;

    if (!otp) {
      return;
    }

    const otpData = { id, otp };
    try {
      await axios.post('https://api-brosforlyf.onrender.com/api/user/verify', otpData).then((res) => {
        // Handle successful verification, navigation, and any additional logic
        console.log('Verification successful:', res.data);
        setOtp1('');
        setOtp2('');
        setOtp3('');
        setOtp4('');
        setOtp5('');
        setOtp6('');
        navigate('/photo');
        if (localStorage.email) localStorage.removeItem('email');
      });
    } catch (err) {
      console.error('Verification failed:', err);
      // Handle verification failure, show error messages, etc.
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center', height:'100vh'}}>
    <form className="otp-form" onSubmit={handleSubmit}>
      <div className="container ">
        {/* Include your header or relevant content here */}
      </div>

      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="form-group text-center">
              <label className="margin-align">Enter the Code sent to {email}</label>
              <div className="form-group-input otp-form-group mb-3">
                <input
                  type="text"
                  id="otp1"
                  name="otp1"
                  value={otp1}
                  onChange={handleInputChange}
                  minLength="1"
                  maxLength="1"
                  className="form-control otp-inputbar"
                  required
                />
                <input
                  type="text"
                  id="otp2"
                  name="otp2"
                  value={otp2}
                  onChange={handleInputChange}
                  minLength="1"
                  maxLength="1"
                  className="form-control otp-inputbar"
                  required
                />
                <input
                  type="text"
                  id="otp3"
                  name="otp3"
                  value={otp3}
                  onChange={handleInputChange}
                  minLength="1"
                  maxLength="1"
                  className="form-control otp-inputbar"
                  required
                />
                <input
                  type="text"
                  id="otp4"
                  name="otp4"
                  value={otp4}
                  onChange={handleInputChange}
                  minLength="1"
                  maxLength="1"
                  className="form-control otp-inputbar"
                  required
                />
                <input
                  type="text"
                  id="otp5"
                  name="otp5"
                  value={otp5}
                  onChange={handleInputChange}
                  minLength="1"
                  maxLength="1"
                  className="form-control otp-inputbar"
                  required
                />
                <input
                  type="text"
                  id="otp6"
                  name="otp6"
                  value={otp6}
                  onChange={handleInputChange}
                  minLength="1"
                  maxLength="1"
                  className="form-control otp-inputbar"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="errmsg" className="text-center"></div>

      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="form-group text-center otp-actions">
              <button type="submit">Submit OTP</button>
            </div>
          </div>
        </div>
      </div>
    </form>
    </div>
  );
};

export default OtpForm;
