import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import { FileData, getFileContent, getFileServeUrl, getDownloadUrl, extractFileNameFromUrl } from '../services/operation/fileAPI';

interface FilePreviewProps {
  file: FileData | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (fileId: string, fileName: string) => void;
}

// Text File Preview Component
const TextFilePreview: React.FC<{ fileUrl: string; file: FileData }> = ({ fileUrl, file }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [fileStats, setFileStats] = useState<any>(null);

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        setLoading(true);
        
        // Extract filename from URL
        const fileName = extractFileNameFromUrl(file.url);
        console.log("📄 Fetching text content for file:", fileName);
        
        // Use new API to get file content from local filesystem
        const response = await getFileContent(fileName);
        
        if (response.success && response.fileType === 'text') {
          setContent(response.content);
          setFileStats(response.stats);
          console.log("✅ Text content loaded from server:", {
            characters: response.stats?.characterCount,
            words: response.stats?.wordCount,
            lines: response.stats?.lineCount
          });
        } else {
          // Fallback to direct fetch if not a text file or API fails
          console.log("📄 Falling back to direct fetch from:", fileUrl);
          const directResponse = await fetch(fileUrl);
          if (!directResponse.ok) {
            throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
          }
          const text = await directResponse.text();
          setContent(text);
          console.log("✅ Text content loaded via fallback, length:", text.length);
        }
      } catch (err: any) {
        console.error("❌ Error loading text content:", err);
        setError(err.message || 'Failed to load file content');
      } finally {
        setLoading(false);
      }
    };

    fetchTextContent();
  }, [fileUrl, file.url]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading file content...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <FileText size={48} className="mx-auto text-red-500 mb-2" />
          <p className="text-red-600 dark:text-red-400 font-medium">Failed to load file content</p>
          <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="mt-3 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
          >
            <ExternalLink size={16} />
            Open in New Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-white">File Content</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {fileStats ? (
              <span>
                {fileStats.characterCount.toLocaleString()} chars, {fileStats.wordCount.toLocaleString()} words, {fileStats.lineCount.toLocaleString()} lines
              </span>
            ) : file.characterCountFormatted ? (
              <span>{file.characterCountFormatted} characters</span>
            ) : null}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-auto">
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
            {content}
          </pre>
        </div>
        
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => window.open(fileUrl, '_blank')}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition duration-200"
          >
            <ExternalLink size={16} />
            Open Full Screen
          </button>
        </div>
      </div>
    </div>
  );
};

// PDF Preview Component
const PDFPreview: React.FC<{ fileUrl: string; file: FileData }> = ({ fileUrl, file }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Get the proper file serving URL
  const fileName = extractFileNameFromUrl(file.url);
  const serveUrl = getFileServeUrl(fileName);

  return (
    <div className="w-full">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-red-500" />
            <span className="font-medium text-gray-900 dark:text-white">PDF Document</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {file.sizeFormatted}
          </span>
        </div>
        
        {/* Try multiple PDF viewing methods */}
        <div className="space-y-4">
          {/* Method 1: Direct iframe with proper serve URL */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <iframe
              src={serveUrl}
              className="w-full h-96"
              title={file.name}
              onLoad={() => setLoading(false)}
              onError={() => setError('PDF iframe failed to load')}
            />
          </div>
          
          {/* Method 2: Embed tag fallback */}
          {error && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <embed
                src={fileUrl}
                type="application/pdf"
                className="w-full h-96"
                onError={() => console.log('Embed also failed')}
              />
            </div>
          )}
          
          {/* Method 3: Alternative PDF viewer options */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.open(serveUrl, '_blank')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <ExternalLink size={16} />
              Open in New Tab
            </button>
            
            <button
              onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(serveUrl)}&embedded=true`, '_blank')}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            >
              <ExternalLink size={16} />
              View with Google Docs
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 If PDF doesn't display properly, try opening in a new tab or downloading the file
          </p>
        </div>
      </div>
    </div>
  );
};

// Document Preview Component (for .doc, .docx, .ppt, .pptx, .xls, .xlsx)
const DocumentPreview: React.FC<{ fileUrl: string; file: FileData }> = ({ fileUrl, file }) => {
  // Get the proper file serving URL
  const fileName = extractFileNameFromUrl(file.url);
  const serveUrl = getFileServeUrl(fileName);

  return (
    <div className="w-full">
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            <span className="font-medium text-gray-900 dark:text-white">Document Preview</span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {file.sizeFormatted}
          </span>
        </div>
        
        <div className="space-y-4">
          {/* Office Online Viewer */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(serveUrl)}`}
              className="w-full h-96"
              title={file.name}
              onError={(e) => console.error('Office viewer error:', e)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.open(serveUrl, '_blank')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              <ExternalLink size={16} />
              Open in New Tab
            </button>
            
            <button
              onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(serveUrl)}&embedded=true`, '_blank')}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
            >
              <ExternalLink size={16} />
              View with Google Docs
            </button>
            
            <button
              onClick={() => window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(serveUrl)}`, '_blank')}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition duration-200"
            >
              <ExternalLink size={16} />
              Office Online
            </button>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            💡 Document viewers work best when your file is publicly accessible
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced Audio Preview Component
const AudioPreview: React.FC<{ fileUrl: string; file: FileData }> = ({ fileUrl, file }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Get the proper file serving URL
  const fileName = extractFileNameFromUrl(file.url);
  const serveUrl = getFileServeUrl(fileName);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value) / 100;
    
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file.fileType.toUpperCase()} • {file.sizeFormatted}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {file.durationFormatted && `Duration: ${file.durationFormatted}`}
          </div>
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          preload="metadata"
          onError={(e) => console.error('Audio load error:', e)}
        >
          <source src={serveUrl} type={file.fileType} />
          <source src={fileUrl} type={file.fileType} />
          Your browser does not support the audio tag.
        </audio>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Skip Back */}
          <button
            onClick={() => skipTime(-10)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Skip back 10s"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 3c-1.74 0-3.41.81-4.5 2.09C6.07 6.07 5 8.03 5 10.25c0 .17.01.33.03.5H6.5V9h-1v1.25l1.47 1.47L8 10.69V9H6.5v1.75H8l-.03-.5c0-1.67.83-3.15 2.09-4.09.84-.63 1.87-1.16 2.94-1.16 2.48 0 4.5 2.02 4.5 4.5s-2.02 4.5-4.5 4.5c-.17 0-.33-.01-.5-.03v1.53c.17.02.33.03.5.03 3.31 0 6-2.69 6-6s-2.69-6-6-6z"/>
              <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor">10</text>
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => skipTime(10)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Skip forward 10s"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5 3c1.74 0 3.41.81 4.5 2.09C17.93 6.07 19 8.03 19 10.25c0 .17-.01.33-.03.5H17.5V9h1v1.25l-1.47 1.47L16 10.69V9h1.5v1.75H16l.03-.5c0-1.67-.83-3.15-2.09-4.09-.84-.63-1.87-1.16-2.94-1.16-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5c.17 0 .33.01.5.03v1.53c-.17-.02-.33-.03-.5-.03-3.31 0-6-2.69-6-6s2.69-6 6-6z"/>
              <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor">10</text>
            </svg>
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={toggleMute}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {isMuted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Video Preview Component
const VideoPreview: React.FC<{ fileUrl: string; file: FileData }> = ({ fileUrl, file }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get the proper file serving URL
  const fileName = extractFileNameFromUrl(file.url);
  const serveUrl = getFileServeUrl(fileName);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value) / 100;
    
    if (video) {
      video.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  return (
    <div className="w-full">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file.fileType.toUpperCase()} • {file.sizeFormatted}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {file.durationFormatted && `Duration: ${file.durationFormatted}`}
          </div>
        </div>

        {/* Video Element */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full max-h-96 object-contain"
            poster=""
            preload="metadata"
            onError={(e) => console.error('Video load error:', e)}
            onClick={togglePlay}
          >
            <source src={serveUrl} type={file.fileType} />
            <source src={fileUrl} type={file.fileType} />
            Your browser does not support the video tag.
          </video>

          {/* Video Overlay Controls */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200 opacity-0 hover:opacity-100"
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Video Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Skip Back */}
            <button
              onClick={() => skipTime(-10)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Skip back 10s"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 3c-1.74 0-3.41.81-4.5 2.09C6.07 6.07 5 8.03 5 10.25c0 .17.01.33.03.5H6.5V9h-1v1.25l1.47 1.47L8 10.69V9H6.5v1.75H8l-.03-.5c0-1.67.83-3.15 2.09-4.09.84-.63 1.87-1.16 2.94-1.16 2.48 0 4.5 2.02 4.5 4.5s-2.02 4.5-4.5 4.5c-.17 0-.33-.01-.5-.03v1.53c.17.02.33.03.5.03 3.31 0 6-2.69 6-6s-2.69-6-6-6z"/>
                <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor">10</text>
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg"
            >
              {isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skipTime(10)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Skip forward 10s"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.5 3c1.74 0 3.41.81 4.5 2.09C17.93 6.07 19 8.03 19 10.25c0 .17-.01.33-.03.5H17.5V9h1v1.25l-1.47 1.47L16 10.69V9h1.5v1.75H16l.03-.5c0-1.67-.83-3.15-2.09-4.09-.84-.63-1.87-1.16-2.94-1.16-2.48 0-4.5 2.02-4.5 4.5s2.02 4.5 4.5 4.5c.17 0 .33.01.5.03v1.53c-.17-.02-.33-.03-.5-.03-3.31 0-6-2.69-6-6s2.69-6 6-6z"/>
                <text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor">10</text>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Fullscreen"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilePreview: React.FC<FilePreviewProps> = ({ file, isOpen, onClose, onDownload }) => {
  if (!isOpen || !file) return null;

  const getFileUrl = (url: string) => {
    // Ensure the URL is properly formatted for the backend
    if (url.startsWith('/files/')) {
      return `http://localhost:8000${url}`;
    }
    return url;
  };

  const renderFileContent = () => {
    const fileUrl = getFileUrl(file.url);
    
    // Get proper serving URL for files from local filesystem
    const fileName = extractFileNameFromUrl(file.url);
    const serveUrl = getFileServeUrl(fileName);
    
    // Determine if this is an audio or video file based on category or MIME type
    const isVideoFile = file.category === 'video' || file.category === 'videos' || 
                       file.fileType.startsWith('video/');
    const isAudioFile = file.category === 'audio' || file.category === 'audios' || 
                       file.fileType.startsWith('audio/');

    switch (file.category) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img 
              src={serveUrl} 
              alt={file.name}
              className="max-w-full max-h-96 object-contain rounded-lg"
              onError={(e) => {
                console.error('Image load error:', e);
                console.log('Fallback to original URL:', fileUrl);
                // Fallback to original URL
                (e.target as HTMLImageElement).src = fileUrl;
              }}
            />
          </div>
        );
      
      case 'video':
      case 'videos':
        return <VideoPreview fileUrl={fileUrl} file={file} />;
      
      case 'audio':
      case 'audios':
        return <AudioPreview fileUrl={fileUrl} file={file} />;
      
      case 'pdf':
        return <PDFPreview fileUrl={fileUrl} file={file} />;
      
      case 'text':
        return <TextFilePreview fileUrl={fileUrl} file={file} />;
      
      case 'document':
        return <DocumentPreview fileUrl={fileUrl} file={file} />;
      
      default:
        // Check MIME type if category doesn't match
        if (isVideoFile) {
          return <VideoPreview fileUrl={fileUrl} file={file} />;
        }
        if (isAudioFile) {
          return <AudioPreview fileUrl={fileUrl} file={file} />;
        }
        
        return (
          <div className="text-center">
            <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Preview not available for this file type.
              </p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                <ExternalLink size={16} />
                Open in New Tab
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>{file.fileType.toUpperCase()}</span>
              <span>{file.sizeFormatted}</span>
              <span className="hidden sm:inline">{file.uploadDateFormatted}</span>
              {file.durationFormatted && <span>Duration: {file.durationFormatted}</span>}
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => {
                const fileName = extractFileNameFromUrl(file.url);
                const downloadUrl = getDownloadUrl(fileName);
                console.log("⬇️ Preview download:", fileName, downloadUrl);
                
                // Direct download approach
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = file.name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-1 sm:gap-0 px-3 py-1 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition duration-200 text-sm sm:text-base"
              title="Download"
            >
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="sm:hidden">Download</span>
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center gap-1 sm:gap-0 px-3 py-1 sm:p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition duration-200 text-sm sm:text-base"
              title="Close"
            >
              <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="sm:hidden">Close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6 overflow-auto max-h-[75vh] sm:max-h-[70vh]">
          {renderFileContent()}
          
          {/* File Details */}
          {(file.description || file.tags.length > 0) && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              {file.description && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Description:
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {file.description}
                  </p>
                </div>
              )}
              
              {file.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Tags:
                  </h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {file.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreview; 