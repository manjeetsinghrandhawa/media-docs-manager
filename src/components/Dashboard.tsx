import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../store';
import { setToken } from '../slices/authSlice';
import FileUpload from './FileUpload';
import FileList from './FileList';

const Dashboard: React.FC = () => {
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
    <div className="min-h-screen p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="surface-card mb-6 flex flex-col gap-4 p-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Control Center</p>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">File Manager Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-rose-300/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25"
          >
            Logout
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="surface-card mb-4 p-3 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('files')}
              className={`chip-tab flex-1 text-sm sm:flex-none sm:text-base ${
                activeTab === 'files'
                  ? 'active'
                  : 'hover:text-white'
              }`}
            >
              My Files
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`chip-tab flex-1 text-sm sm:flex-none sm:text-base ${
                activeTab === 'upload'
                  ? 'active'
                  : 'hover:text-white'
              }`}
            >
              Upload Files
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="surface-card p-4 sm:p-6">
          {activeTab === 'upload' ? (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-white sm:mb-6 sm:text-xl">Upload New Files</h2>
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