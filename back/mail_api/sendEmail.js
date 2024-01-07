const nodemailer = require('nodemailer');

const otpemail=(otp,otpExpiryMessage)=>`
<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>One-Time Password (OTP)</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                text-align: center;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #666;
            }
            .otp-code {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-top: 20px;
            }
            .note {
                margin-top: 20px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Your One Time Signup code</h1>
            <p>Your one-time password is:</p>
            <p class="otp-code">${otp}</p>
            <p class="note">${otpExpiryMessage}. Do not share it with anyone.</p>
        </div>
    </body>
    </html>
    `

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASS
    },
    tls: {
        rejectUnauthorized: false
      }
  });


const sendemail=(email,otp,otpExpiryMessage)=>{

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: 'Otp Email',
    html:otpemail(otp,otpExpiryMessage)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error:', error);
    }
    console.log('Email sent:', info.response);
  });
}
module.exports=sendemail