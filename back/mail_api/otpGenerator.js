const bcrypt = require('bcrypt');

const generateOtp = async () => {
  try {
    const min = 0;
    const max = 9;
    const count = 6;
    const nums = [];
    
    // Set a seed for random number generation (use current timestamp as seed)
    const seed = new Date().getTime();
    
    for (let i = 0; i < count; i++) {
      const randomNumber = Math.floor(Math.random(seed) * (max - min + 1)) + min;
      nums.push(randomNumber);
    }
    
    const otp = nums.join('');
    
    // Hash the OTP using bcrypt
    const encrypted = await bcrypt.hash(otp, 10);
     // Calculate expiration time (in milliseconds)
     const otpExpiry = Date.now() + 600 * 1000 // OTP expires after 10 minute
     // Calculate the remaining time in seconds
     const remainingTimeInSeconds = Math.floor((otpExpiry - Date.now()) / 1000)
     
     // Calculate minutes and seconds
     const minutes = Math.floor(remainingTimeInSeconds / 60)
     const seconds = remainingTimeInSeconds % 60
     
     // Format the remaining time message
     let otpExpiryMessage = `The OTP expires in `
     if (minutes > 0) {
       otpExpiryMessage += `${minutes} minute${minutes > 1 ? 's' : ''}`
       if (seconds > 0) {
         otpExpiryMessage += ` and ${seconds} second${seconds > 1 ? 's' : ''}`
       }
     } else {
       otpExpiryMessage += `${seconds} second${seconds > 1 ? 's' : ''}`
     }
    return { otp, encrypted, otpExpiry,otpExpiryMessage };
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw error; // Propagate the error
  }
};

module.exports = generateOtp;