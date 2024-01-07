const bcrypt=require('bcrypt')

const passChecker=async(pass,encrypted)=>{
    const stringifiedPASS=pass.toString()
    try{
        const isValid=await bcrypt.compare(stringifiedPASS,encrypted)
        return isValid
    }
    catch(err){
        console.log(err)
    }
}
module.exports=passChecker