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
    <div className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 py-8">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="surface-card w-full max-w-[560px] p-6 lg:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Verification</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-white">
            Verify Email
          </h1>
          <p className="my-4 text-base leading-7 text-slate-200">
            A verification code has been sent to your email. Enter the code below.
          </p>
          <form onSubmit={handleVerification}>
            <div className="mb-6">
              <label className="w-full">
                <p className="mb-1 text-sm leading-[1.375rem] text-slate-100">
                  Verification Code <sup className="text-rose-300">*</sup>
                </p>
                <input
                  required
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter verification code"
                  className="ui-input"
                />
              </label>
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-3"
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