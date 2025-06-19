import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../store';
import { setToken } from '../slices/authSlice';
import FileUpload from './FileUpload';
import FileList from './FileList';

const Dashboard: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('files');

  const handleLogout = () => {
    dispatch(setToken(null));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('files'); // Switch to files tab after upload
  };

  return (
    <div className="min-h-screen bg-richblack-800 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">File Manager Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-300 text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-richblack-700 rounded-lg mb-4 sm:mb-6">
          <div className="flex border-b border-gray-600">
            <button
              onClick={() => setActiveTab('files')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-medium transition duration-200 text-sm sm:text-base ${
                activeTab === 'files'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              My Files
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-medium transition duration-200 text-sm sm:text-base ${
                activeTab === 'upload'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Upload Files
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="bg-richblack-700 rounded-lg p-4 sm:p-6">
          {activeTab === 'upload' ? (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Upload New Files</h2>
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : (
            <div>
              <FileList refreshTrigger={refreshTrigger} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 