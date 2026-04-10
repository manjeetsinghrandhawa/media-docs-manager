import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { AppDispatch } from '../store';
import { uploadFile } from '../services/operation/fileAPI';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  // Allowed file types
  const allowedTypes = [
    '.txt', '.srt', '.docx','.pdf',  // Text files
    '.mp3', '.wav',           // Audio files
    '.mp4', '.webm',           // Video files
  ];

  const allowedMimeTypes = [
    'text/plain', 'application/x-subrip', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf',
    'audio/mpeg', 'audio/wav', 'audio/wave',
    'video/mp4', 'video/webm'
  ];

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.includes(fileExtension) || allowedMimeTypes.includes(file.type);
    
    if (!isValidType) {
      alert(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`);
      return false;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert('File size exceeds 50MB limit');
      return false;
    }

    return true;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(validateFile);
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        await dispatch(uploadFile(file));
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setSelectedFiles([]);
      setUploadProgress(null);
      onUploadSuccess();
    } catch (error) {
      setUploadProgress(null);
      console.error('Upload failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    return <File size={20} className="text-blue-500" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        className={`rounded-2xl border-2 border-dashed p-4 text-center transition-colors duration-200 sm:p-8 ${
          isDragOver
            ? 'border-cyan-300 bg-cyan-400/10'
            : 'border-slate-300/30 bg-slate-900/35'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={48} className="mx-auto mb-4 h-8 w-8 text-cyan-200 sm:h-12 sm:w-12" />
        <h3 className="mb-2 text-base font-medium text-white sm:text-lg">
          Drop files here or click to browse
        </h3>
        <p className="mb-4 px-2 text-xs text-slate-300 sm:text-sm">
          Supports: {allowedTypes.slice(0, 4).join(', ')}{allowedTypes.length > 4 ? '...' : ''} (Max 50MB each)
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary px-4 py-2 text-sm sm:px-6 sm:text-base"
        >
          Choose Files
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h4 className="mb-3 text-base font-medium text-white sm:mb-4 sm:text-lg">
            Selected Files ({selectedFiles.length})
          </h4>
          
          <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-slate-300/20 bg-slate-900/50 p-2 sm:p-3"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-white sm:text-sm">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-300">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 transition duration-200 p-1"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mt-4 flex justify-center sm:justify-end">
            <button
              onClick={uploadFiles}
              disabled={uploadProgress !== null}
              className={`px-4 sm:px-6 py-2 rounded-lg text-white transition duration-300 text-sm sm:text-base w-full sm:w-auto ${
                uploadProgress !== null
                  ? 'cursor-not-allowed bg-slate-500'
                  : 'btn-primary'
              }`}
            >
              {uploadProgress !== null ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
            </button>
          </div>

          {/* Progress Bar */}
          {uploadProgress !== null && (
            <div className="mt-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-slate-200">
                {Math.round(uploadProgress)}% complete
              </p>
            </div>
          )}
        </div>
      )}

      {/* File Type Info */}
      <div className="surface-soft mt-6 p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle size={20} className="mt-0.5 text-cyan-200" />
          <div>
            <h5 className="text-sm font-medium text-cyan-100">
              Supported File Types
            </h5>
            <div className="mt-1 text-sm text-slate-200">
              <p><strong>Text:</strong> .txt, .srt, .docx, .pdf</p>
              <p><strong>Audio:</strong> .mp3, .wav</p>
              <p><strong>Video:</strong> .mp4, .webm</p>
              <p className="mt-1 text-xs">Maximum file size: 50MB per file</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload; 