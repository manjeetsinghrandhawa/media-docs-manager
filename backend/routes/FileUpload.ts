import express from "express";

import {
  localFileUpload,
  imageUpload,
  videoUpload,
  upload,
  allfiles,
  getUserFilesFromUserModel,
  deleteFile,
  serveFile,
  getFileContent,
  downloadFile
} from "../controllers/fileUpload";

const router = express.Router();

// API routes
router.post("/upload", upload);
router.post("/upload-test", upload); // Test route without auth
router.post("/imageUpload", imageUpload);
router.post("/videoUpload", videoUpload);

// Test route to verify backend is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    routes_available: ["/allfiles", "/upload", "/delete/:fileId", "/user-files"]
  });
});

// Get all files for a user
router.get("/allfiles", allfiles);
router.post("/allfiles", allfiles); // Support both GET and POST

// Alternative route to get files from User model's files array
router.get("/user-files", getUserFilesFromUserModel);
router.post("/user-files", getUserFilesFromUserModel);

// Delete file route
router.delete("/delete/:fileId", deleteFile);

// File serving routes for preview and download
router.get("/serve/:fileName", serveFile);           // Serve file directly
router.get("/content/:fileName", getFileContent);    // Get file content for preview
router.get("/download/:fileName", downloadFile);     // Force download with proper headers

export default router;
