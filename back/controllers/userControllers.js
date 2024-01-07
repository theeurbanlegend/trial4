const { MongoClient, GridFSBucket } = require('mongodb')
const { ObjectId } = require('mongoose').Types;
const bcrypt=require('bcrypt')
const mongoose = require('mongoose')
const multer = require('multer')
const User = require('../models/userSchema')
const generateOtp = require('../mail_api/otpGenerator')
const sendemail = require('../mail_api/sendEmail')
const passChecker = require('../auth/verifyPass')
const otpChecker = require('../mail_api/otpVerifier')

require('dotenv').config()
const mongoClient = new MongoClient(process.env.MONGO_URI)
const conn = mongoose.createConnection(process.env.MONGO_URI)

let gfs

conn.once('open', async() => {
  console.log('Register online')
  await mongoClient.connect().then(()=>{
    console.log('Db ready for register!')
  })
  // Initialize GridFSBucket
  const db = mongoClient.db('test') // Replace with your actual database name
  gfs = new GridFSBucket(db)
})


const upload = multer({ storage: multer.memoryStorage() })

const register = async (req, res) => {
    const { fullname, username, password, email } = req.body
    if (!fullname || !username || !password || !email) {
      return res.status(400).json({
        msg: "Invalid or inadequate credentials!",
      })
    }
    //Cross check if username exists
    let user=await User.findOne({username})
    if(user){
        return res.status(400).json({
            msg:"Username is already taken!"
        })
    }
    let photoId='' // Store the GridFS file ID if a photo is uploaded
  
    try {
      // Check if a photo was uploaded
      if (req.file) {
        const fileBuffer = req.file.buffer
  
        // Create a write stream to GridFS
        const writeStream = gfs.openUploadStream({
          filename: req.file.originalname,
        })
  
        // Write the file buffer to the stream
        writeStream.end(fileBuffer)
  
        // Wait for the file to be stored in GridFS
        await new Promise((resolve, reject) => {
          writeStream.on('finish', resolve)
          writeStream.on('error', reject)
        })
  
        // Get the ID of the uploaded file in GridFS
        photoId = writeStream.id
      }
      const {otp,encrypted,otpExpiry,otpExpiryMessage}=await generateOtp()
      sendemail(email,otp,otpExpiryMessage)
      const encryptedPassword=await bcrypt.hash(password,10)
      // Create a new user in the database (assuming Post is a Mongoose model)
      const newUser = new User({
        fullname,
        username,
        password:encryptedPassword,
        currentEmail:email,
        isVerified:false,
        updatedEmail:'',
        otp:encrypted,
        photo:{ filename:photoId}, // Save the photo ID in the user document
      })
  
      // Save the user to the database
      await newUser.save()
  
      return res.status(201).json({
        msg: "Registration successful!",
        id:newUser._id
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        msg: "Internal server error",
      })
    }
  }

const registerWithUpload = (req, res, next) => {
  // Use multer middleware to handle file uploads
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ msg: 'Photo upload error' })
    }
    register(req, res, next)
  })
}

const getUserData=async(req,res)=>{
  const id=req.params.id
  if(!id||!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({msg:" Invalid ID"})
  }
  const user = await User.findById(id)
  if(!user){
    return res.status(404).json({
      msg:"User Not found!"
    })
  }
  return res.status(200).json({user:user})
  }

const uploadPhoto = (req, res, next) => {
  // Use multer middleware to handle file uploads
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ msg: 'Photo upload error' })
    }
    addphoto(req, res, next)
  })
}

const getAllUsers=async(req,res)=>{
  const users=await User.find()
  if(!users){
    return res.status(404).json({msg:" No users Yet"})
  }
  return res.status(200).json(users)
}

const addphoto = async (req, res) => {
  const { id, currentPhotoId } = req.body;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      msg: "Invalid user ID",
    });
  }
  

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      msg: "No user found by that ID",
    });
  }

  if (req.file) {
    const photo = req.file;
    let photoId;

    try {
      // Assuming you want to save the photo to GridFS
      const photoBuffer = photo.buffer;

      // Create a write stream to GridFS
      const writeStream = gfs.openUploadStream({
        filename: req.file.originalname,
      });

      // Write the file buffer to the stream
      writeStream.end(photoBuffer);

      // Wait for the new file to be stored in GridFS
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      photoId = writeStream.id;

      // Delete the existing profile photo from GridFS
       if (currentPhotoId) {
        if (!mongoose.Types.ObjectId.isValid(currentPhotoId)) {
          return res.status(400).json({
            msg: "Invalid current photo ID",
          });
        }
        gfs.delete(new mongoose.Types.ObjectId(currentPhotoId), (err) => {
          if (err) {
            console.error('Error deleting existing photo:', err);
          }
        });
      }
      // Update user's photo information
      user.photo.filename = photoId;
      await user.save();

      return res.status(200).json({
        msg: "Photo added successfully!",
        id: photoId,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  } else {
    return res.status(404).json({
      msg: "No Photo Found!",
    });
  }
};

const login = async (req, res) => {
    const { username, password, email } = req.body;
    // Check if either username or email is present along with the password
    if ((username || email) && password) {
      try {
        // Assuming you have a User model
        let user;
  
        if (username) {
          // If username is provided, query by username
          user = await User.findOne({ username });
        }
        if (email) {
          // If email is provided, query by email
          user = await User.findOne({ currentEmail:email });
        }
        if(!user){
            return res.status(404).json({msg:'Not found!!!'})
        }
        const encrypted=user.password
        const verifypass=await passChecker(password,encrypted)
        if (verifypass) {
          // If the user is found and the password is correct, perform login
          return res.status(200).json({
            msg: "Login successful!",
            id:user._id
          });
        } else {
          // If user is not found or password is incorrect
          return res.status(401).json({
            msg: "Invalid credentials!",
          });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
    } else {
      // If either username or email is missing or password is missing
      return res.status(400).json({
        msg: "Invalid or inadequate credentials!",
      });
    }
  };
  
const verifyOTP=async(req,res)=>{
    const { id, otp } = req.body;
    // Check if either username or email is present along with the password
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      try {
        // Assuming you have a User model

        let user=await User.findById(id);
  
        
        if(!user){
            return res.status(404).json({msg:'Not found!!!'})
        }
        const encryptedOTP=user.otp
        const verifyOTP=await otpChecker(otp,encryptedOTP)
        if (verifyOTP) {
            user.otp=''
            user.isVerified=true
            if(user.currentEmail && user.updatedEmail){
                user.currentEmail=user.updatedEmail
                user.updatedEmail=''
                console.log("User details updated!")
            }
            await user.save()
          // If the user is found and the password is correct, perform login
          return res.status(200).json({
            msg: "OTP verification successful!",
          });
        } else {
          // If user is not found or password is incorrect
          return res.status(401).json({
            msg: "Invalid OTP!",
          });
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
    } else {
      // If either username or email is missing or password is missing
      return res.status(400).json({
        msg: "Invalid or inadequate credentials!",
      });
    }
}


const resendOTP=async(req,res)=>{
  
}


const updateDetails=async(req,res)=>{
    const { username, password, oldemail,newemail } = req.body;
    // Check if either username or email is present along with the password
    if ((oldemail && newemail) && username) {
      try {
        // Assuming you have a User model
        let user= await User.findOne({ username });
        
        if(!user){
            return res.status(404).json({msg:'Not found!!!'})
        }
        const {otp,encrypted,otpExpiryMessage}=await generateOtp()

        user.updatedEmail=newemail
        user.otp=encrypted
        sendemail(newemail,otp,otpExpiryMessage)
        user.isVerified=false
        await user.save()
        return res.status(200).json({msg:"Awaiting OTP verification",id:user._id})
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
    } else {
      // If either username or email is missing or password is missing
      return res.status(400).json({
        msg: "Invalid or inadequate credentials!",
      });
    }
  };

 
  const getFileById = async (req, res) => {
    const fileId = req.params.filename;

    if (!fileId) {
        console.log('File ID not provided!');
        return res.status(400).json({ msg: 'File ID not provided' });
    }

    try {
        // Find one file by its _id
        const file = await gfs.find({ _id: new ObjectId(fileId) }).toArray();

        if (!file || file.length === 0) {
            console.log('File not found!');
            return res.status(404).json({ msg: 'File not found' });
        }

        // Set the proper content type for the response (adjust based on image format)
        res.set('Content-Type', 'image/jpeg'); // Adjust content type based on your image format

        // Pipe the file stream to the response
        const readStream = gfs.openDownloadStream(new ObjectId(fileId));
        readStream.pipe(res);
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
};


const logout=async(req,res)=>{}
module.exports={
getAllUsers,register:registerWithUpload,addphoto:uploadPhoto,verifyOTP,login,logout,updateDetails,getProfilePhoto:getFileById,getUserData}