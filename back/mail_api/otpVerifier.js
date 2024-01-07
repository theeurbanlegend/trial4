const bcrypt=require('bcrypt')

const otpChecker=async(otp,encrypted)=>{
    const stringifiedOTP=otp.toString()
    try{
        const isValid=await bcrypt.compare(stringifiedOTP,encrypted)
        return isValid
    }
    catch(err){
        console.log(err)
    }
}
module.exports=otpChecker