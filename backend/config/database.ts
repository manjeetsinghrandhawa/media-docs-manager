import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log("DB Connection Successful");
  } catch (error) {
    console.log("DB Connection Issues");
    console.error(error);
    process.exit(1);
  }
};
