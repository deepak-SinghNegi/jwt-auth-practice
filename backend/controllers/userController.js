import userModel from "../models/userModel.js";

export const getUserData = async (req ,res) =>{
    try {
        const {userId} = req.body;
        const user = await userModel.findById(userId);
        if(!user)return res.status(403).json({message : "user not exist"});
        const {name , email , isVerified}  = user;
        return res.status(200).json({name ,email , isVerified});
    } catch (error) {
        return res.status(500).json({message : error.message});
    }
}