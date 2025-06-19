import React, { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import type { AppDispatch } from "../store";
import { sendOtp } from "../services/operation/authAPI";
import { setSignupData } from "../slices/authSlice";

interface FormDataType {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<FormDataType>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    const signupData = {
      ...formData,
    };
    
    // Store signup data for later use after OTP verification
    dispatch(setSignupData(signupData));
    
    // Send OTP to user for verification
    dispatch(sendOtp(email, navigate));
  };

  return (
    <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="w-full">
          <p className="mb-1 text-[0.875rem] text-richblack-5">
            First Name <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            type="text"
            name="firstName"
            value={firstName}
            onChange={handleOnChange}
            placeholder="Enter first name"
            className="w-full rounded bg-richblack-800 p-3 text-richblack-5"
          />
        </label>

        <label className="w-full">
          <p className="mb-1 text-[0.875rem] text-richblack-5">
            Last Name <sup className="text-pink-200">*</sup>
          </p>
          <input
            required
            type="text"
            name="lastName"
            value={lastName}
            onChange={handleOnChange}
            placeholder="Enter last name"
            className="w-full rounded bg-richblack-800 p-3 text-richblack-5"
          />
        </label>
      </div>

      <label className="w-full">
        <p className="mb-1 text-[0.875rem] text-richblack-5">
          Email Address <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type="email"
          name="email"
          value={email}
          onChange={handleOnChange}
          placeholder="Enter email address"
          className="w-full rounded bg-richblack-800 p-3 text-richblack-5"
        />
      </label>

      <label className="relative w-full">
        <p className="mb-1 text-[0.875rem] text-richblack-5">
          Password <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={handleOnChange}
          placeholder="Enter password"
          className="w-full rounded bg-richblack-800 p-3 pr-10 text-richblack-5"
        />
        <span
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[42px] cursor-pointer"
        >
          {showPassword ? (
            <EyeOff size={24} color="#AFB2BF" />
          ) : (
            <Eye size={24} color="#AFB2BF" />
          )}
        </span>
      </label>

      <label className="relative w-full">
        <p className="mb-1 text-[0.875rem] text-richblack-5">
          Confirm Password <sup className="text-pink-200">*</sup>
        </p>
        <input
          required
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleOnChange}
          placeholder="Confirm password"
          className="w-full rounded bg-richblack-800 p-3 pr-10 text-richblack-5"
        />
        <span
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-3 top-[42px] cursor-pointer"
        >
          {showConfirmPassword ? (
            <EyeOff size={24} color="#AFB2BF" />
          ) : (
            <Eye size={24} color="#AFB2BF" />
          )}
        </span>
      </label>

      <button
        type="submit"
        className="mt-6 rounded bg-yellow-50 py-3 px-4 font-medium text-richblack-900 hover:bg-yellow-100 transition duration-300"
      >
        Create Account
      </button>
    </form>
  );
};

export default SignupForm;
