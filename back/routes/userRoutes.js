const { register, login, verifyOTP, updateDetails, addphoto, getUserData, getAllUsers, getProfilePhoto } = require('../controllers/userControllers')


const userRoute=require('express').Router()



userRoute.get('/photo/:filename',getProfilePhoto)
userRoute.get('/all',getAllUsers)
userRoute.get('/current/:id',getUserData)
userRoute.post('/register',register)
userRoute.post('/login',login)
userRoute.post('/add',addphoto)
userRoute.post('/verify',verifyOTP)
userRoute.post('/update',updateDetails)


module.exports=userRoute



