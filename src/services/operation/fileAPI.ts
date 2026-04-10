import { toast } from "react-hot-toast";
import { apiConnector } from "../apiconnector";
import { endpoints, BASE_URL, BACKEND_URL } from "../api";

const { UPLOAD_FILE_API, GET_FILES_API } = endpoints;

export interface FileData {
  id: string;
  name: string;
  url: string;
  fileType: string;
  category: string;
  size: number;
  sizeFormatted: string;
  uploadDate: string;
  uploadDateFormatted: string;
  duration?: number;
  durationFormatted?: string;
  characterCount?: number;
  characterCountFormatted?: string;
  tags: string[];
  description: string;
  email: string;
}

// Upload file
export function uploadFile(file: File) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Uploading file...");

    try {
      // Get user data from localStorage
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      
      console.log("📧 User data from localStorage:", user);
      console.log("📧 User email from localStorage:", user?.email);
      
      const formData = new FormData();
      formData.append("file", file);
      
      // Add user email to FormData if available
      if (user?.email) {
        formData.append("email", user.email);
        console.log("📧 Email added to FormData:", user.email);
      } else {
        console.warn("⚠️ No user email found in localStorage");
      }
      
      // Add user ID if available
      if (user?._id) {
        formData.append("userId", user._id);
        console.log("👤 User ID added to FormData:", user._id);
      }

      const response = await apiConnector("POST", UPLOAD_FILE_API, formData, {
        "Content-Type": "multipart/form-data",
      }, undefined);

      console.log("UPLOAD FILE API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("File uploaded successfully");
      return response.data.file;
    } catch (error: any) {
      console.log("UPLOAD FILE API ERROR............", error);
      toast.error(error?.response?.data?.message || "File upload failed");
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// Get all user files
export function getUserFiles() {
  return async (dispatch: any) => {
    try {
      // Get user data from localStorage
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      
      console.log("📧 User data from localStorage for file fetch:", user);
      console.log("📧 User email from localStorage for file fetch:", user?.email);
      console.log("🔍 GET_FILES_API value:", GET_FILES_API);
      
      // Ensure we have the correct API URL - fallback if needed
      let baseApiUrl = GET_FILES_API;
      if (!baseApiUrl.includes('/allfiles')) {
        baseApiUrl = `${BASE_URL}/files/allfiles`;
        console.log("⚠️ Using fallback API URL:", baseApiUrl);
      }
      
      // Construct URL with email query parameter if available
      let apiUrl = baseApiUrl;
      if (user?.email) {
        apiUrl += `?email=${encodeURIComponent(user.email)}`;
        console.log("📧 Fetching files for email:", user.email);
        console.log("🌐 Final API URL:", apiUrl);
      } else {
        console.warn("⚠️ No user email found in localStorage, fetching all files");
        console.log("🌐 Final API URL:", apiUrl);
      }

      console.log("🚀 Making API call to:", apiUrl);
      const response = await apiConnector("GET", apiUrl, null, undefined, undefined);

      console.log("GET FILES API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      console.log("✅ Successfully fetched files:", response.data.files?.length || 0, "files");
      return response.data.files;
    } catch (error: any) {
      console.error("GET FILES API ERROR............", error);
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      
      // Try alternative endpoint as fallback
      if (error.response?.status === 404) {
        console.log("🔄 Trying alternative endpoint...");
        try {
          // Re-get user data for fallback
          const userString = localStorage.getItem("user");
          const userData = userString ? JSON.parse(userString) : null;
          const fallbackUrl = `${BASE_URL}/files/allfiles${userData?.email ? `?email=${encodeURIComponent(userData.email)}` : ''}`;
          console.log("🔄 Fallback URL:", fallbackUrl);
          
          const fallbackResponse = await apiConnector("GET", fallbackUrl, null, undefined, undefined);
          if (fallbackResponse.data.success) {
            console.log("✅ Fallback successful!");
            return fallbackResponse.data.files;
          }
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
        }
      }
      
      toast.error(error?.response?.data?.message || "Failed to fetch files");
      throw error;
    }
  };
}

// Delete file
export function deleteFile(fileId: string) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Deleting file...");

    try {
      const response = await apiConnector("DELETE", `${BASE_URL}/files/delete/${fileId}`, null, undefined, undefined);

      console.log("DELETE FILE API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("File deleted successfully");
      return true;
    } catch (error: any) {
      console.log("DELETE FILE API ERROR............", error);
      toast.error(error?.response?.data?.message || "File deletion failed");
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// Download file
export function downloadFile(fileId: string, filename: string) {
  return async (dispatch: any) => {
    const toastId = toast.loading("Downloading file...");

    try {
      console.log("🔽 Starting enhanced download for:", filename);
      console.log("🔽 File ID:", fileId);
      
      // Get user data to find the file
      const userString = localStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : null;
      
      if (user?.email) {
        // Get all files to find the correct file URL
        const filesResponse = await fetch(`${BASE_URL}/files/allfiles?email=${encodeURIComponent(user.email)}`);
        const filesData = await filesResponse.json();
        
        if (filesData.success) {
          const file = filesData.files.find((f: any) => f.id === fileId);
          if (file && file.url) {
            // Extract actual filename and use new download endpoint
            const actualFileName = extractFileNameFromUrl(file.url);
            const downloadUrl = getDownloadUrl(actualFileName);
            
            console.log("🔽 Enhanced download URL:", downloadUrl);
            
            // Method 1: Try fetch with blob for better download control
            try {
              const response = await fetch(downloadUrl);
              if (response.ok) {
                const blob = await response.blob();
                
                // Create download link with blob
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename; // Use original filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                toast.success("File download completed");
                return;
              }
            } catch (fetchError) {
              console.warn("⚠️ Fetch download failed:", fetchError);
            }
            
            // Method 2: Fallback to direct link
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("File download started");
            return;
          }
        }
      }
      
      // Final fallback: try original static serving
      const fallbackUrl = `${BACKEND_URL}/files/${filename}`;
      console.log("🔽 Final fallback download URL:", fallbackUrl);
      
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("File download started");
    } catch (error: any) {
      console.error("DOWNLOAD FILE ERROR............", error);
      toast.error("File download failed");
      throw error;
    } finally {
      toast.dismiss(toastId);
    }
  };
}

// Get file content for preview from local filesystem
export const getFileContent = async (fileName: string) => {
  console.log("📄 Getting file content for:", fileName);
  try {
    const response = await apiConnector("GET", `${BASE_URL}/files/content/${fileName}`, null, undefined, undefined);
    console.log("✅ File content retrieved:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error getting file content:", error);
    throw error;
  }
};

// Serve file directly from local filesystem  
export const getFileServeUrl = (fileName: string): string => {
  return `${BASE_URL}/files/serve/${fileName}`;
};

// Download file with proper headers from server
export const getDownloadUrl = (fileName: string): string => {
  return `${BASE_URL}/files/download/${fileName}`;
};

// Extract filename from file URL
export const extractFileNameFromUrl = (url: string): string => {
  // Handle URLs like "/files/Resume-Manjeet_1750315565138.pdf"
  if (url.startsWith('/files/')) {
    return url.replace('/files/', '');
  }
  // Handle full URLs
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1];
};

// Debug: Test new file serving endpoints
export const testFileServing = async (fileName: string) => {
  console.log("🔗 Testing file serving for:", fileName);
  try {
    const contentResponse = await getFileContent(fileName);
    const serveUrl = getFileServeUrl(fileName);
    const downloadUrl = getDownloadUrl(fileName);
    
    console.log("✅ File serving test results:", {
      content: contentResponse,
      serveUrl,
      downloadUrl
    });
    
    return {
      content: contentResponse,
      serveUrl,
      downloadUrl
    };
  } catch (error: any) {
    console.error("❌ File serving test failed:", error);
    throw error;
  }
}; 