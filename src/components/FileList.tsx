import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  FileText, FileAudio, FileVideo, File, 
  Download, Trash2, Eye, Calendar, 
  FolderOpen, Clock, User
} from 'lucide-react';
import { AppDispatch } from '../store';
import { getUserFiles, deleteFile, downloadFile, FileData, getDownloadUrl, extractFileNameFromUrl } from '../services/operation/fileAPI';
import { testBackendConnection, testAllFilesEndpoint, debugUserData } from '../services/operation/debugAPI';
import FilePreview from './FilePreview';

interface FileListProps {
  refreshTrigger: number;
}

const FileList: React.FC<FileListProps> = ({ refreshTrigger }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'text' | 'audio' | 'video' | 'image' | 'pdf' | 'document' | 'archive'>('all');
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      
      // Debug: Test backend connectivity
      console.log("🔧 Starting comprehensive debugging...");
      
      // 1. Test backend connection
      try {
        await testBackendConnection();
      } catch (error) {
        console.error("❌ Backend not responding");
      }
      
      // 2. Debug user data
      const user = debugUserData();
      
      // 3. Test allfiles endpoint directly
      if (user?.email) {
        try {
          const directTest = await testAllFilesEndpoint(user.email);
          console.log("✅ Direct endpoint test successful:", directTest);
        } catch (error) {
          console.error("❌ Direct endpoint test failed:", error);
        }
      }
      
      // 4. Try the regular getUserFiles function
      const userFiles = await dispatch(getUserFiles());
      setFiles(userFiles || []);
      
      console.log("✅ Files loaded successfully:", userFiles?.length || 0, "files");
    } catch (error) {
      console.error('❌ Failed to fetch files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        console.log("🗑️ Deleting file:", fileName, "ID:", fileId);
        await dispatch(deleteFile(fileId));
        console.log("✅ File deleted successfully");
        await fetchFiles(); // Refresh the list
      } catch (error: any) {
        console.error('❌ Failed to delete file:', error);
        alert(`Failed to delete file: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      console.log("⬇️ Starting enhanced download for:", fileName, "ID:", fileId);
      
      // Find the file in our current files list to get the correct URL
      const file = files.find(f => f.id === fileId);
      if (file && file.url) {
        // Extract the actual filename from the URL
        const actualFileName = extractFileNameFromUrl(file.url);
        console.log("📁 Extracted filename:", actualFileName);
        
        // Use the new download endpoint with proper headers
        const downloadUrl = getDownloadUrl(actualFileName);
        console.log("⬇️ Enhanced download URL:", downloadUrl);
        
        // Method 1: Try direct download with proper headers
        try {
          const response = await fetch(downloadUrl);
          if (response.ok) {
            const blob = await response.blob();
            
            // Create download link with blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName; // Use original filename for user-friendly name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log("✅ Enhanced download completed");
            return;
          }
        } catch (fetchError) {
          console.warn("⚠️ Fetch download failed, trying direct link:", fetchError);
        }
        
        // Method 2: Fallback to direct link approach
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log("✅ Fallback download initiated");
        
      } else {
        console.warn("⚠️ File not found in list, using legacy method");
        // Final fallback to the dispatch method
        await dispatch(downloadFile(fileId, fileName));
      }
    } catch (error: any) {
      console.error('❌ Failed to download file:', error);
      alert(`Failed to download file: ${error.message || 'Unknown error'}`);
    }
  };

  const handleView = (file: FileData) => {
    try {
      console.log("👁️ Opening preview for:", file.name, "ID:", file.id);
      console.log("👁️ File URL:", file.url);
      console.log("👁️ File category:", file.category);
      
      setPreviewFile(file);
      setIsPreviewOpen(true);
      console.log("✅ Preview modal opened");
    } catch (error: any) {
      console.error('❌ Failed to open file preview:', error);
      alert(`Failed to preview file: ${error.message || 'Unknown error'}`);
    }
  };

  const getFileIcon = (category: string, fileType: string) => {
    switch (category) {
      case 'image':
        return <FileText size={24} className="text-green-500" />;
      case 'video':
        return <FileVideo size={24} className="text-red-500" />;
      case 'audio':
        return <FileAudio size={24} className="text-purple-500" />;
      case 'pdf':
        return <FileText size={24} className="text-red-600" />;
      case 'text':
        return <FileText size={24} className="text-blue-500" />;
      case 'document':
        return <FileText size={24} className="text-blue-600" />;
      case 'archive':
        return <FolderOpen size={24} className="text-yellow-500" />;
      default:
        return <File size={24} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to normalize category names
  const normalizeCategory = (category: string): string => {
    const normalized = category.toLowerCase();
    if (normalized === 'videos') return 'video';
    if (normalized === 'audios') return 'audio';
    if (normalized === 'images') return 'image';
    if (normalized === 'documents') return 'document';
    return normalized;
  };

  // Get file category counts for filter display
  const getCategoryCounts = () => {
    const counts = files.reduce((acc, file) => {
      const category = normalizeCategory(file.category);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      all: files.length,
      text: counts.text || 0,
      audio: counts.audio || 0,
      video: counts.video || 0,
      image: counts.image || 0,
      pdf: counts.pdf || 0,
      document: counts.document || 0,
      archive: counts.archive || 0,
      other: files.length - Object.values(counts).reduce((sum, count) => sum + count, 0)
    };
  };

  const categoryCounts = getCategoryCounts();

  const sortedAndFilteredFiles = files
    .filter(file => {
      // Text search filter
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.fileType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      if (categoryFilter === 'all') {
        return matchesSearch;
      }
      
      const normalizedFileCategory = normalizeCategory(file.category);
      const matchesCategory = normalizedFileCategory === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadDate);
          bValue = new Date(b.uploadDate);
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'type':
          aValue = a.fileType;
          bValue = b.fileType;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header with Search and Sort */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {categoryFilter === 'all' 
                ? `Your Files (${files.length})` 
                : `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Files (${sortedAndFilteredFiles.length}/${files.length})`
              }
            </h2>
            
            {/* Debug Info - Hidden on mobile */}
            {files.length > 0 && (
              <button
                onClick={() => {
                  console.log("🔧 Debug: Current files:", files);
                  console.log("🔧 Debug: First file structure:", files[0]);
                }}
                className="hidden sm:block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title="Debug files data"
              >
                Debug Files
              </button>
            )}
          </div>
          
          {/* Search */}
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Files', icon: '📁', count: categoryCounts.all },
            { key: 'text', label: 'Text', icon: '📝', count: categoryCounts.text },
            { key: 'audio', label: 'Audio', icon: '🎵', count: categoryCounts.audio },
            { key: 'video', label: 'Video', icon: '🎥', count: categoryCounts.video },
            { key: 'image', label: 'Images', icon: '🖼️', count: categoryCounts.image },
            { key: 'pdf', label: 'PDF', icon: '📄', count: categoryCounts.pdf },
            { key: 'document', label: 'Documents', icon: '📊', count: categoryCounts.document },
            { key: 'archive', label: 'Archives', icon: '🗜️', count: categoryCounts.archive }
          ].map((category) => (
            <button
              key={category.key}
              onClick={() => setCategoryFilter(category.key as any)}
              className={`px-3 py-2 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base ${
                categoryFilter === category.key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="text-base sm:text-lg">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <span className="sm:hidden">{category.label.length > 8 ? category.label.substring(0, 8) + '...' : category.label}</span>
              {category.count > 0 && (
                <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-bold ${
                  categoryFilter === category.key
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Sort Controls (moved to a smaller section) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="type">Type</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Files Grid/List */}
      {sortedAndFilteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || categoryFilter !== 'all' 
              ? 'No files match your filters' 
              : 'No files uploaded yet'
            }
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || categoryFilter !== 'all'
              ? 'Try adjusting your search terms or category filter'
              : 'Upload your first file to get started'
            }
          </p>
          
          {!searchTerm && files.length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                📁 If you have uploaded files but don't see them here:
              </p>
              <ul className="text-xs text-blue-500 dark:text-blue-300 mt-2 space-y-1">
                <li>• Make sure you're logged in with the correct account</li>
                <li>• Check the browser console for any error messages</li>
                <li>• Try refreshing the page</li>
                <li>• Ensure the backend server is running on port 8000</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1">
          {sortedAndFilteredFiles.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* File Info */}
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.category, file.fileType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </h3>
                    
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <File size={14} className="sm:w-4 sm:h-4" />
                        <span className="truncate">{file.fileType}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <FolderOpen size={14} className="sm:w-4 sm:h-4" />
                        <span className="truncate">{file.sizeFormatted}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 col-span-2 sm:col-span-1">
                        <Calendar size={14} className="sm:w-4 sm:h-4" />
                        <span className="truncate">{file.uploadDateFormatted}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1 col-span-2 sm:col-span-1">
                        <User size={14} className="sm:w-4 sm:h-4" />
                        <span className="truncate">Category: {file.category}</span>
                      </div>
                      
                      {file.durationFormatted && (
                        <div className="flex items-center space-x-1 col-span-2">
                          <Clock size={14} className="sm:w-4 sm:h-4" />
                          <span className="truncate">Duration: {file.durationFormatted}</span>
                        </div>
                      )}
                      
                      {file.characterCountFormatted && (
                        <div className="flex items-center space-x-1 col-span-2">
                          <FileText size={14} className="sm:w-4 sm:h-4" />
                          <span className="truncate">{file.characterCountFormatted} chars</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {file.description && (
                      <div className="mt-2">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic line-clamp-2">
                          "{file.description}"
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {file.tags && file.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {file.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {file.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{file.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end sm:flex-col sm:items-center space-x-2 sm:space-x-0 sm:space-y-2 sm:ml-4">
                  <button
                    onClick={() => handleView(file)}
                    className="flex items-center gap-1 sm:gap-0 px-3 py-1 sm:p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition duration-200 text-xs sm:text-sm"
                    title="View"
                  >
                    <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="sm:hidden">View</span>
                  </button>
                  
                  <button
                    onClick={() => handleDownload(file.id, file.name)}
                    className="flex items-center gap-1 sm:gap-0 px-3 py-1 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition duration-200 text-xs sm:text-sm"
                    title="Download"
                  >
                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="sm:hidden">Download</span>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(file.id, file.name)}
                    className="flex items-center gap-1 sm:gap-0 px-3 py-1 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition duration-200 text-xs sm:text-sm"
                    title="Delete"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="sm:hidden">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreview
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewFile(null);
        }}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default FileList; 