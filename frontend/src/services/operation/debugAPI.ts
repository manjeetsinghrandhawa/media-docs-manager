// Debug API functions to test backend connectivity

export const testBackendConnection = async () => {
  console.log("🔧 Testing backend connection...");
  
  try {
    // Test basic backend connectivity
    const response = await fetch('http://localhost:8000/api/v1/files/test');
    const data = await response.json();
    console.log("✅ Backend test successful:", data);
    return data;
  } catch (error) {
    console.error("❌ Backend test failed:", error);
    throw error;
  }
};

export const testAllFilesEndpoint = async (email?: string) => {
  console.log("🔧 Testing allfiles endpoint...");
  
  try {
    const url = email 
      ? `http://localhost:8000/api/v1/files/allfiles?email=${encodeURIComponent(email)}`
      : 'http://localhost:8000/api/v1/files/allfiles';
    
    console.log("🌐 Testing URL:", url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log("✅ AllFiles test successful:", data);
    return data;
  } catch (error) {
    console.error("❌ AllFiles test failed:", error);
    throw error;
  }
};

export const debugUserData = () => {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  
  console.log("🔧 User data debug:");
  console.log("- Raw user string:", userString);
  console.log("- Parsed user:", user);
  console.log("- User email:", user?.email);
  console.log("- User ID:", user?._id);
  
  return user;
}; 