const mongoose = require('mongoose');


// Define the schema for the post
const userSchema = new mongoose.Schema({
  fullname: {type:String},
  username: {type:String},
  password:{type:String},
  otp:{type:String},
  isVerified:{type:Boolean},
  currentEmail:{type:String},
  updatedEmail:{type:String},
  photo: {
   filename:{type: String}
  }
},{timestamps:true});


const User = mongoose.model('User', userSchema);

module.exports = User;

