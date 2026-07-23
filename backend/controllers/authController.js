import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ message: "allfields are required" });
    }
    try {
        if (await userModel.findOne({ email })) {
            return res.json({ message: "user already exists" });
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

        })
        return res.status(201).json({ message: "account created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "error creating account", error: error.message });
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ message: "all fields are required" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ message: "invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ message: "invalid credentials" });
                
            }
        
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000, // 1 day

        });
        return res.status(200).json({ message: "login successful" });
        

    } catch (error) {
        res.status(500).json({ message: "error logging in", error: error.message });
    }
}
export const logout = async (req, res) => {
    try{
        res.clearCookie("token" , {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        return res.status(200).json({ message: "logout successful" });
    } catch (error) {
        res.status(500).json({ message: "error logging out", error: error.message });
    }
}
