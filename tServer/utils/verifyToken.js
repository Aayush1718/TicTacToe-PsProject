import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    return user; 
    
  } catch (err) {
    console.error("Error verifying token:", err.message);
    return null;
  }
};



