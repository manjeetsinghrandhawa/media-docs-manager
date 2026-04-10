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
          <p className="mb-1 text-sm text-slate-100">
            First Name <sup className="text-rose-300">*</sup>
          </p>
          <input
            required
            type="text"
            name="firstName"
            value={firstName}
            onChange={handleOnChange}
            placeholder="Enter first name"
            className="ui-input"
          />
        </label>

        <label className="w-full">
          <p className="mb-1 text-sm text-slate-100">
            Last Name <sup className="text-rose-300">*</sup>
          </p>
          <input
            required
            type="text"
            name="lastName"
            value={lastName}
            onChange={handleOnChange}
            placeholder="Enter last name"
            className="ui-input"
          />
        </label>
      </div>

      <label className="w-full">
        <p className="mb-1 text-sm text-slate-100">
          Email Address <sup className="text-rose-300">*</sup>
        </p>
        <input
          required
          type="email"
          name="email"
          value={email}
          onChange={handleOnChange}
          placeholder="Enter email address"
          className="ui-input"
        />
      </label>

      <label className="relative w-full">
        <p className="mb-1 text-sm text-slate-100">
          Password <sup className="text-rose-300">*</sup>
        </p>
        <input
          required
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={handleOnChange}
          placeholder="Enter password"
          className="ui-input pr-10"
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
        <p className="mb-1 text-sm text-slate-100">
          Confirm Password <sup className="text-rose-300">*</sup>
        </p>
        <input
          required
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleOnChange}
          placeholder="Confirm password"
          className="ui-input pr-10"
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
        className="btn-primary mt-6 py-3 px-4"
      >
        Create Account
      </button>
    </form>
  );
};

export default SignupForm;
