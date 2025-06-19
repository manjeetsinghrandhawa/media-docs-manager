import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User";

// Load environment variables
dotenv.config();

// Extend Express Request type to add `user` property
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

// Auth middleware function
export const auth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Extract token from cookie, body, or Authorization header
    const token =
      req.cookies?.token ||
      req.body?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    // If token is missing, return 401
    if (!token) {
      return res.status(401).json({ success: false, message: `Token Missing` });
    }

    try {
      // Verify the token
      const decode = jwt.verify(token, process.env.JWT_SECRET as string);
      console.log(decode);

      // Attach decoded payload to req.user
      req.user = decode;
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Token is invalid" });
    }

    // Move to next middleware or controller
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: `Something went wrong while validating the token`,
    });
  }
};
