import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard';
import VerifyEmail from './components/VerifyEmail';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Provider store={store}>
      <div className="flex min-h-screen w-screen flex-col bg-richblack-900 font-inter">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <div className="w-full text-4xl pl-10 font-bold text-blue-600 p-4 hover:text-blue-300 hover:underline transition duration-300 cursor-pointer">
              <div>Welcome to File Manager</div>
              <div className="text-lg text-white mt-4">
                Sign up or login to upload and manage your files securely
              </div>
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/dashboard/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </Provider>
  );
}

export default App;
