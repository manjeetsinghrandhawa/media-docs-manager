import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for User document
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  image?: string;
  files: mongoose.Types.ObjectId[]; // reference to uploaded files
  createdAt: Date;
  updatedAt: Date;
  token?: string; // optional token field
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true, // make sure each email is unique
    },
    password: {
      type: String,
      required: true,
    },
    token: {
			type: String,
		},
    image: {
      type: String,
      default: "https://placehold.co/50x50", // default image URL
    },
    
    files: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
  },
  { timestamps: true }
);

// Export the User model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
