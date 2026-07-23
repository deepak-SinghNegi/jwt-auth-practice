import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: "String",
        required: true,
    },
    email: {
        type: "String",
        required: true,
        unique: true,
    },
    password: {
        type: "String",
        required: true,
    },
    verifiedOtp: {
        type: "String",
        default: "",
    },
    verifiedOtpExpiredAt: {
        type: "number",
        default: 0,
    },
    isVerified: {
        type: "Boolean",
        default: false,
    },
    resetPasswordOtp: {
        type: "String",
        default: "",

    },
    resetPasswordOtpExpiredAt: {
        type: "number",
        default: 0,
    },
})
const userModel = mongoose.model("User", userSchema);
export default userModel;