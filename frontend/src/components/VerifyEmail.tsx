import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { signUp } from '../services/operation/authAPI';

const VerifyEmail: React.FC = () => {
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { signupData, loading } = useSelector((state: RootState) => state.auth);

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData) {
      dispatch(
        signUp(
          'Student', // Default account type
          signupData.firstName,
          signupData.lastName,
          signupData.email,
          signupData.password,
          signupData.confirmPassword,
          otp,
          navigate
        )
      );
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="max-w-[500px] p-4 lg:p-8">
          <h1 className="text-[1.875rem] font-semibold leading-[2.375rem] text-richblack-5">
            Verify Email
          </h1>
          <p className="my-4 text-[1.125rem] leading-[1.625rem] text-richblack-100">
            A verification code has been sent to your email. Enter the code below.
          </p>
          <form onSubmit={handleVerification}>
            <div className="mb-6">
              <label className="w-full">
                <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                  Verification Code <sup className="text-pink-200">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter verification code"
                  style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                  className="w-full rounded-[0.5rem] bg-richblack-800 p-[12px] text-richblack-5"
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full rounded-[8px] bg-yellow-50 py-[12px] px-[12px] font-medium text-richblack-900"
            >
              Verify Email
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail; 