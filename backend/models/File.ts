import mongoose, { Document, Schema } from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Interface for File document
export interface IFile extends Document {
  name: string;
  url: string;
  fileType: string;
  size: number;
  duration?: number; // for audio/video files
  characterCount?: number; // for text files
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  tags?: string[];
  email?: string;
  description?: string;
}

// Mongoose schema
const fileSchema: Schema<IFile> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, required: true },   // e.g., 'image/png', 'video/mp4'
    size: { type: Number, required: true },       // in bytes
    duration: { type: Number },
  characterCount: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String },
    tags: { type: [String], default: [] },        // array of strings for better tagging
    email: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

// Post-save middleware
fileSchema.post("save", async function (doc: IFile): Promise<void> {
  try {
    console.log("DOC:", doc);

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `Manjeet <${process.env.MAIL_USER}>`,
      to: doc.email,
      subject: "New File Uploaded on Cloudinary",
      html: `<h2>Hello</h2><p>Your file has been uploaded: <a href="${doc.url}">${doc.name}</a></p>`,
    });

    console.log("INFO:", info);
  } catch (error) {
    console.error(error);
  }
});

// Export model
const File = mongoose.model<IFile>("File", fileSchema);
export default File;
