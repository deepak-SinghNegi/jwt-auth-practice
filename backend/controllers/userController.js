import userModel from "../models/userModel.js";

export const getUserData = async (req ,res) =>{
    try {
        const {userId} = req;
        const user = await userModel.findById(userId);
        if(!user)return res.status(403).json({success:false,message : "user not exist"});
        const {name , email , isVerified}  = user;
        return res.status(200).json({success:true,userData: {
        name,
        email,
        isVerified
    }});
    } catch (error) {
        
        return res.status(500).json({success:false,message : error.message});
    }
}