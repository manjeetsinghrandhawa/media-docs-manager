import React, { useState, ChangeEvent, FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import type { AppDispatch } from "../store";
import { login } from "../services/operation/authAPI";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { email, password } = formData;

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    if (password.length < 1) {
      toast.error("Please enter a password");
      return;
    }

    dispatch(login(email, password, navigate));
  };

  return (
    <form onSubmit={handleOnSubmit} className="flex w-full flex-col gap-y-4">
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
        <Link to="/forgot-password">
          <p className="mt-1 ml-auto max-w-max text-xs text-blue-100">
            Forgot Password?
          </p>
        </Link>
      </label>

      <button
        type="submit"
        className="mt-6 rounded bg-yellow-50 py-3 px-4 font-medium text-richblack-900 hover:bg-yellow-100 transition duration-300"
      >
        Sign In
      </button>
    </form>
  );
};

export default LoginForm;
