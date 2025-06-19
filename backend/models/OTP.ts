import mongoose, { Document, Schema, Model } from "mongoose";
import mailSender from "../utils/mailSender";
import emailTemplate from "../mail/emailVerification";

// Define an interface for the OTP document
export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

// Define the OTP schema
const OTPSchema: Schema<IOTP> = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5, // document auto-deletes after 5 minutes
  },
});

// Function to send verification email
async function sendVerificationEmail(email: string, otp: string): Promise<void> {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemplate(otp)
    );
    console.log("Email sent successfully: ", mailResponse.response);
  } catch (error) {
    console.error("Error occurred while sending email: ", (error as Error).message);
    throw error;
  }
}

// Pre-save hook to send email after document is saved
OTPSchema.pre("save", async function (next) {
  const doc = this as IOTP;

  console.log("New document saved to database");

  if (doc.isNew) {
    await sendVerificationEmail(doc.email, doc.otp);
  }

  next();
});

// Define and export the OTP model
const OTP: Model<IOTP> = mongoose.model<IOTP>("OTP", OTPSchema);
export default OTP;
