import express from "express";
import {register, login, logout ,verificationOtp,verifyEmail, isAuthenticated,sendPassResetOtp, resetPassword } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
const authRouter = express.Router();

authRouter.post("/register" , register);
authRouter.post("/login" , login);
authRouter.post("/logout" , logout);
authRouter.post("/send-verify-otp" ,userAuth, verificationOtp);
authRouter.post("/verify-account" ,userAuth, verifyEmail);
authRouter.post("/is-auth" ,userAuth, isAuthenticated);
authRouter.post("/send-pass-reset-otp" , sendPassResetOtp);
authRouter.post("/reset-password" , resetPassword);


export default authRouter;