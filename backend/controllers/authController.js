import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({success:false, message: "allfields are required" });
    }
    try {
        if (await userModel.findOne({ email })) {
            return res.json({success:false, message: "user already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({
            name,
            email,
            password: hashedPassword,
        })
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day

        });
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to our app",
            text: `Hello ${name},\n\nThank you for registering with our app! We're excited to have you on board.\n\nBest regards,\nThe Team`,
        });
        return res.status(201).json({success:true, message: "account created successfully" });
    }
    catch (error) {
        res.status(500).json({ success:false,message: "error creating account", error: error.message });
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({success:false, message: "all fields are required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({success:false, message: "invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({success:false, message: "invalid credentials" });

        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day

        });
        return res.status(200).json({success:true, message: "login successful" });


    } catch (error) {
        res.status(500).json({success:false, message: "error logging in", error: error.message });
    }
}
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        return res.status(200).json({success:true, message: "logout successful" });
    } catch (error) {
        res.status(500).json({ success:false,message: "error logging out", error: error.message });
    }
}
export const verificationOtp = async (req, res) => {
    const { userId } = req;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success:false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success:false,
                message: "User is already verified"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verifiedOtp = otp;
        user.verifiedOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Your Verification OTP",
            text: `Hello ${user.name},

Your verification OTP is: ${otp}

Please use this OTP to verify your email address.

Best regards,
The Team`
        });

        return res.status(200).json({
            success:true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: "Error sending OTP",
            error: error.message
        });
    }
};
export const verifyEmail = async (req, res) => {
    const { userId, otp } = req;
    if (!userId || !otp) {
        return res.json({success:false, message: "Missing Details" });
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({success:false, message: "User Not found" });
        }
        if (user.verifiedOtp == '' || user.verifiedOtp !== otp) {
            return res.json({ success:false,message: 'Invalid otp ', });
        }
        if (user.verifiedOtpExpiredAt < Date.now()) {
            return res.json({success:false, message: 'otp expired' });
        }
        user.isVerified = true;
        user.verifiedOtpExpiredAt = 0;
        user.verifiedOtp = "";
        await user.save();
        return res.json({ success:true,message: "email varified successfully" })
    } catch (error) {
        return res.json({success:false, message: error.message });
    }
}
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({success:true, message: "verified user" });
    } catch (error) {
        return res.status(500).json({success:false, message: error.message });
    }
}
export const sendPassResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({success:false, message: "Email is required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({success:false, message: "No account found with this email" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiredAt = Date.now()+ 24 * 60 * 60 * 1000;
        await user.save();
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Password reset OTP",
            text: `Hello ${user.name},

Your Email Reset OTP is: ${otp}

Please use this OTP to verify your email address.

Best regards,
The Team`
        });
        return res.status(200).json({success:true, message: "reset password otp sent to your Email" });

    } catch (error) {
        return res.status(500).json({ success:false,message: error.message });
    }

}

export const resetPassword = async (req, res) => {
    const { email, newPassword, otp } = req.body;
    if (!email || !newPassword || !otp) {
        return res.status(400).json({success:false, message: "all credentials are required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({success:false, message: "Account not found" });
        }
        if (user.resetPasswordOtp === '' || user.resetPasswordOtp !== otp) {
            return res.status(401).json({success:false, message: "Invalid otp" });
        }
        if (user.resetPasswordOtpExpiredAt < Date.now()) {
            return res.status(401).json({success:false, message: "OTP has expired" , ex : user.resetPasswordOtpExpiredAt  });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOtp = '';
        user.resetPasswordOtpExpiredAt = 0;
        await user.save();
        res.status(200).json({success:true, message: "password has been changed" });
    } catch (error) {
        return res.status(500).json({success:false, message: error.message });
    }
}

