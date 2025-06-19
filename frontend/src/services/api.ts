const BASE_URL = 'http://localhost:8000/api/v1';
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  
  // File management endpoints
  UPLOAD_FILE_API: BASE_URL + "/files/upload",
  GET_FILES_API: BASE_URL + "/files/allfiles",
  DELETE_FILE_API: BASE_URL + "/files/delete",
  DOWNLOAD_FILE_API: BASE_URL + "/files/download"
}