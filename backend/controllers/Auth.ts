import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OTP from "../models/OTP";
import otpGenerator from "otp-generator";

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecretkey";

interface AuthRequest extends Request {
  user?: IUser;
}


//For new User SignUp
export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, image } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      image,
    });

    // Generate JWT Token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Save token into user document (if your User model has a token field)
    newUser.token = token;
    await newUser.save();

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    // Send response with token in cookie and in JSON
    res.cookie("token", token, options).status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: newUser,
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
//For User Login

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if email or password is missing
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill up all the required fields",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered with us. Please sign up to continue.",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set token in user document (optional, if your model has a token field)
    user.token = token;
    await user.save();

    // Remove password from response
    const userObj = user.toObject();
    

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), //3 days
      httpOnly: true,
    };

    // Set cookie and respond
    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user: userObj,
      message: "User login successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Login failure, please try again",
    });
  }
};




// Send OTP controller
export const sendotp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;
    console.log("Request Body:", req.body);
    // Check if user is already registered
    const checkUserPresent = await User.findOne({ email });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      });
    }

    // Generate OTP
    let otp: string = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Ensure unique OTP (unlikely but handled)
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    // Save OTP in DB
    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);

    console.log("OTP Body:", otpBody);

    return res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};



