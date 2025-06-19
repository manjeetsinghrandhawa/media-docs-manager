import { Request, Response } from "express";
import File from "../models/File";
import User from "../models/User";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// Local file upload handler
export const localFileUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req.files?.file as UploadedFile);
    if (!file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    console.log("FILE RECEIVED -> ", file);

    const path = __dirname + "/files/" + Date.now() + `.${file.name.split('.').pop()}`;
    console.log("PATH -> ", path);

    file.mv(path, (err) => {
      if (err) {
        console.error("File move error:", err);
      }
    });

    res.json({
      success: true,
      message: 'Local File Uploaded Successfully',
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Utility to check supported file types
function isFileTypeSupported(type: string, supportedTypes: string[]): boolean {
  return supportedTypes.includes(type);
}

// Upload file to Cloudinary
async function uploadFileToCloudinary(file: UploadedFile, folder: string, quality?: number) {
  const options: any = { folder };

  console.log("Temp file path:", file.tempFilePath);

  if (quality) {
    options.quality = quality;
  }

  options.resource_type = "auto";

  return await cloudinary.uploader.upload(file.tempFilePath, options);
}

// Image upload handler
export const imageUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, tags, email } = req.body;
    const file = (req.files?.imageFile as UploadedFile);

    if (!file) {
      res.status(400).json({ success: false, message: "No image file uploaded" });
      return;
    }

    const supportedTypes = ["jpg", "jpeg", "png"];
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (!fileType || !isFileTypeSupported(fileType, supportedTypes)) {
      res.status(400).json({ success: false, message: "File format not supported" });
      return;
    }

    const response = await uploadFileToCloudinary(file, "Codehelp");

    await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
    });

    res.json({
      success: true,
      imageUrl: response.secure_url,
      message: 'Image Successfully Uploaded',
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'Something went wrong' });
  }
};

// Video upload handler
export const videoUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, tags, email } = req.body;
    const file = (req.files?.videoFile as UploadedFile);

    if (!file) {
      res.status(400).json({ success: false, message: "No video file uploaded" });
      return;
    }

    const supportedTypes = ["mp4", "mov"];
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (!fileType || !isFileTypeSupported(fileType, supportedTypes)) {
      res.status(400).json({ success: false, message: "File format not supported" });
      return;
    }

    const response = await uploadFileToCloudinary(file, "Codehelp");

    await File.create({
      name,
      tags,
      email,
      imageUrl: response.secure_url,
    });

    res.json({
      success: true,
      imageUrl: response.secure_url,
      message: 'Video Successfully Uploaded',
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: 'Something went wrong' });
  }
};

// Unified upload function for any file type - stores locally
export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file is uploaded
    const file = req.files?.file as UploadedFile;
    if (!file) {
      res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
      return;
    }

    // Extract and validate email from request
    // For multipart form data, check both req.body and req.fields
    let userEmail = req.body.email || (req as any).fields?.email;
    
    // Handle case where email might be an array (some form parsers do this)
    if (Array.isArray(userEmail)) {
      userEmail = userEmail[0];
    }
    
    console.log("🔍 EMAIL DEBUGGING:");
    console.log("- req.body:", req.body);
    console.log("- req.body.email:", req.body.email);
    console.log("- req.fields:", (req as any).fields);
    console.log("- Extracted userEmail:", userEmail);
    console.log("- Type of userEmail:", typeof userEmail);
    
    // Validate email format if provided
    if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      console.warn("⚠️ Invalid email format:", userEmail);
    }

    console.log("FILE RECEIVED -> ", file);
    console.log("File name:", file.name);
    console.log("File size:", file.size);
    console.log("File type:", file.mimetype);

    // Create files directory in controllers folder if it doesn't exist
    const filesDir = path.join(__dirname, "files");
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
      console.log("Files directory created at:", filesDir);
    }

    // Generate unique filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const originalName = path.basename(file.name, fileExtension);
    const uniqueFileName = `${originalName}_${timestamp}${fileExtension}`;
    
    // Full path where file will be stored
    const filePath = path.join(filesDir, uniqueFileName);
    console.log("File will be saved to:", filePath);

    // Move file to the files directory
    await new Promise<void>((resolve, reject) => {
      file.mv(filePath, (err) => {
        if (err) {
          console.error("File move error:", err);
          reject(err);
        } else {
          console.log("File moved successfully to:", filePath);
          resolve();
        }
      });
    });

    // Check file types and set support status
    const fileType = file.mimetype;
    
    // Define supported file categories (this accepts all but provides info)
    const supportedCategories = {
      images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
      videos: ['video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/wmv', 'video/flv'],
      audios: ['audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'],
      documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      presentations: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      archives: ['application/zip', 'application/rar', 'application/x-7z-compressed'],
      text: ['text/plain', 'text/html', 'text/css', 'text/javascript']
    };

    // Determine file category
    let fileCategory = 'other';
    for (const [category, mimeTypes] of Object.entries(supportedCategories)) {
      if (mimeTypes.includes(fileType)) {
        fileCategory = category;
        break;
      }
    }

    // File is supported (we accept all file types)
    const isSupported = true;
    
    // Calculate additional metadata based on file type
    let duration: number | undefined = undefined;
    let characterCount: number | undefined = undefined;
    
    // Enhanced character count calculation for text documents
    if (fileCategory === 'text' || fileType.startsWith('text/') || 
        fileType === 'application/json' || fileType === 'application/xml' ||
        file.name.toLowerCase().endsWith('.txt') || 
        file.name.toLowerCase().endsWith('.md') ||
        file.name.toLowerCase().endsWith('.json') ||
        file.name.toLowerCase().endsWith('.xml') ||
        file.name.toLowerCase().endsWith('.csv')) {
      
      try {
        console.log(`Processing text document: ${file.name}`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        characterCount = fileContent.length;
        
        // Additional text statistics
        const wordCount = fileContent.split(/\s+/).filter(word => word.length > 0).length;
        const lineCount = fileContent.split('\n').length;
        
        console.log(`Text Document Metadata:
          - Total Characters: ${characterCount}
          - Total Words: ${wordCount}
          - Total Lines: ${lineCount}`);
          
      } catch (error) {
        console.error("Error reading text file for character count:", error);
        // Try reading as binary and convert
        try {
          const buffer = fs.readFileSync(filePath);
          characterCount = buffer.toString('utf-8').length;
          console.log(`Character count from buffer: ${characterCount}`);
        } catch (bufferError) {
          console.error("Failed to read file as buffer:", bufferError);
          characterCount = 0;
        }
      }
    }
    
    // Enhanced duration calculation for audio/video files
    if (fileCategory === 'audios' || fileCategory === 'videos' ||
        fileType.startsWith('audio/') || fileType.startsWith('video/')) {
      
      try {
        console.log(`Processing audio/video file: ${file.name}`);
        
        // More accurate duration estimation based on file type and size
        let bitrate = 128; // Default bitrate in kbps
        
        // Adjust bitrate estimation based on file type
        if (fileType.includes('mp3')) bitrate = 128;
        else if (fileType.includes('wav')) bitrate = 1411; // Uncompressed
        else if (fileType.includes('flac')) bitrate = 1000;
        else if (fileType.includes('mp4')) bitrate = 1000; // Video
        else if (fileType.includes('avi')) bitrate = 1500;
        else if (fileType.includes('mkv')) bitrate = 2000;
        
        // Calculate duration: (file size in bits) / (bitrate in bits per second)
        const fileSizeInBits = file.size * 8;
        const bitrateInBitsPerSecond = bitrate * 1000;
        const estimatedDuration = Math.round(fileSizeInBits / bitrateInBitsPerSecond);
        
        duration = estimatedDuration > 0 ? estimatedDuration : 1;
        
        console.log(`Audio/Video Metadata:
          - File Type: ${fileType}
          - File Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB
          - Estimated Bitrate: ${bitrate} kbps
          - Estimated Duration: ${duration} seconds (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`);
          
      } catch (error) {
        console.error("Error calculating duration:", error);
        duration = 0;
      }
    }

    // Store file metadata in MongoDB
    const fileUrl = `/files/${uniqueFileName}`;
    
    // Get user ID from request body, query params, or auth middleware
    const userId = req.body.userId || (req as any).fields?.userId;
    const queryUserId = req.query.userId as string;
    const authUserId = (req as any).user?.id; // From auth middleware when enabled
    
    // Priority: auth middleware > body > query params
    const userObjectId = authUserId || userId || queryUserId;
    
    console.log("🔍 USER ID DEBUGGING:");
    console.log("- req.body.userId:", req.body.userId);
    console.log("- req.fields.userId:", (req as any).fields?.userId);
    console.log("- Final userObjectId:", userObjectId);
    
    // Prepare metadata for database
    const fileMetadata: any = {
      name: file.name,
      url: fileUrl,
      fileType: file.mimetype,
      size: file.size,
      uploadedBy: userObjectId 
        ? new mongoose.Types.ObjectId(userObjectId) 
        : new mongoose.Types.ObjectId(), // Fallback: create new ObjectId
      email: userEmail || "unknown@example.com",
      tags: req.body.tags || (req as any).fields?.tags 
        ? String(req.body.tags || (req as any).fields?.tags).split(',').map((tag: string) => tag.trim()) 
        : [],
      description: req.body.description || (req as any).fields?.description || `${fileCategory} file uploaded - ${file.name}`,
    };

    console.log("📋 Prepared file metadata for MongoDB:");
    console.log("- User Email:", fileMetadata.email);
    console.log("- User ID:", fileMetadata.uploadedBy);
    console.log("- File Name:", fileMetadata.name);
    console.log("- File Type:", fileMetadata.fileType);
    console.log("- Description:", fileMetadata.description);
    console.log("- Tags:", fileMetadata.tags);
    
    // Add duration for audio/video files
    if (duration !== undefined) {
      fileMetadata.duration = duration;
    }
    
    // Add character count for text files
    if (characterCount !== undefined) {
      fileMetadata.characterCount = characterCount;
    }
    
    const newFileDoc = await File.create(fileMetadata);
    
    console.log(`File metadata stored in MongoDB:
      - Database ID: ${newFileDoc._id}
      - File Name: ${newFileDoc.name}
      - File Type: ${newFileDoc.fileType}
      - File Size: ${newFileDoc.size} bytes
      - User Email: ${newFileDoc.email}
      - User ID: ${newFileDoc.uploadedBy}
      - Duration: ${newFileDoc.duration || 'N/A'} seconds
      - Character Count: ${newFileDoc.characterCount || 'N/A'}
      - Category: ${fileCategory}`);
    
    // Verify email was saved by re-querying the document
    const savedFile = await File.findById(newFileDoc._id);
    console.log("✅ Verification - Email in saved document:", savedFile?.email);
    console.log("File metadata saved to MongoDB:", newFileDoc._id);
    
    // Update user's files array with the new file ID
    if (userEmail && mongoose.Types.ObjectId.isValid(userObjectId || '')) {
      try {
        const updatedUser = await User.findByIdAndUpdate(
          userObjectId,
          { $push: { files: newFileDoc._id } },
          { new: true }
        );
        
        if (updatedUser) {
          console.log("✅ User files array updated successfully");
          console.log(`- User: ${updatedUser.email}`);
          console.log(`- Total files: ${updatedUser.files.length}`);
          console.log(`- Added file ID: ${newFileDoc._id}`);
        } else {
          console.warn("⚠️ User not found for files array update");
        }
      } catch (userUpdateError) {
        console.error("❌ Error updating user files array:", userUpdateError);
        // Don't fail the entire upload if user update fails
      }
    } else if (userEmail) {
      // If we have email but not valid ObjectId, try to find user by email
      try {
        const user = await User.findOne({ email: userEmail });
        if (user) {
          const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $push: { files: newFileDoc._id } },
            { new: true }
          );
          
          if (updatedUser) {
            console.log("✅ User files array updated successfully (found by email)");
            console.log(`- User: ${updatedUser.email}`);
            console.log(`- Total files: ${updatedUser.files.length}`);
            console.log(`- Added file ID: ${newFileDoc._id}`);
          }
        } else {
          console.warn("⚠️ User not found by email for files array update:", userEmail);
        }
      } catch (userUpdateError) {
        console.error("❌ Error updating user files array (by email):", userUpdateError);
        // Don't fail the entire upload if user update fails
      }
    } else {
      console.warn("⚠️ No valid user identifier for files array update");
    }
    
    // Prepare response data
    const responseData = {
      success: true,
      message: `File uploaded successfully and metadata stored in database`,
      file: {
        id: newFileDoc._id,
        originalName: file.name,
        uniqueName: uniqueFileName,
        size: file.size,
        type: fileType,
        category: fileCategory,
        isSupported: isSupported,
        savedPath: filePath,
        relativePath: `files/${uniqueFileName}`,
        url: fileUrl,
        uploadTime: new Date().toISOString(),
        duration: duration,
        characterCount: characterCount,
        description: newFileDoc.description,
        tags: newFileDoc.tags
      }
    };

    console.log("Upload successful with MongoDB storage:", responseData);

    // Send success response
    res.status(200).json(responseData);

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ 
      success: false, 
      message: "File upload failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Function to fetch all files uploaded by a user using email
export const allfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📁 Fetching all files for user...");
    console.log("🔍 Request method:", req.method);
    console.log("🔍 Request URL:", req.url);
    console.log("🔍 Request query:", req.query);
    console.log("🔍 Request body:", req.body);
    
    // Get user email from request body, query params, or auth middleware
    let userEmail = req.body.email || (req as any).fields?.email || req.query.email;
    const authUserEmail = (req as any).user?.email; // From auth middleware when enabled
    
    // Handle case where email might be an array (some form parsers do this)
    if (Array.isArray(userEmail)) {
      userEmail = userEmail[0];
    }
    
    // Priority: auth middleware > body/fields > query params
    const finalUserEmail = authUserEmail || userEmail;
    
    console.log("🔍 EMAIL FILTERING DEBUG:");
    console.log("- req.body.email:", req.body.email);
    console.log("- req.fields.email:", (req as any).fields?.email);
    console.log("- req.query.email:", req.query.email);
    console.log("- authUserEmail:", authUserEmail);
    console.log("- finalUserEmail:", finalUserEmail);
    
    let files;
    
    // If user email is provided, filter by email field, otherwise get all files
    if (finalUserEmail) {
      console.log(`📧 Fetching files for user email: ${finalUserEmail}`);
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalUserEmail)) {
        res.status(400).json({
          success: false,
          message: "Invalid email format"
        });
        return;
      }
      
      files = await File.find({ email: finalUserEmail })
        .select('-__v') // Exclude version field
        .sort({ createdAt: -1 }); // Sort by newest first
        
    } else {
      console.log("No user email provided, fetching all files");
      files = await File.find({})
        .select('-__v')
        .sort({ createdAt: -1 });
    }
    
    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // Helper function to format duration for audio/video files
    const formatDuration = (seconds: number): string => {
      if (!seconds) return 'N/A';
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    // Format files for UI display
    const formattedFiles = files.map(file => {
      // Determine file category from MIME type
      let category = 'other';
      if (file.fileType.startsWith('image/')) category = 'image';
      else if (file.fileType.startsWith('video/')) category = 'video';
      else if (file.fileType.startsWith('audio/')) category = 'audio';
      else if (file.fileType.includes('pdf')) category = 'pdf';
      else if (file.fileType.includes('text') || file.fileType.includes('json')) category = 'text';
      else if (file.fileType.includes('zip') || file.fileType.includes('rar')) category = 'archive';
      else if (file.fileType.includes('word') || file.fileType.includes('document')) category = 'document';
      
      return {
        id: file._id,
        name: file.name,
        url: file.url,
        fileType: file.fileType,
        category: category,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        uploadDate: file.createdAt,
        uploadDateFormatted: new Date(file.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        
        // Conditional metadata based on file type
        ...(file.duration && {
          duration: file.duration,
          durationFormatted: formatDuration(file.duration)
        }),
        
        ...(file.characterCount && {
          characterCount: file.characterCount,
          characterCountFormatted: file.characterCount.toLocaleString()
        }),
        
        tags: file.tags || [],
        description: file.description || '',
        email: file.email
      };
    });
    
    // Create summary statistics
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const categorySummary = formattedFiles.reduce((acc: any, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {});
    
    // Log summary
    console.log(`Retrieved ${formattedFiles.length} files for user email: ${finalUserEmail || 'all users'}`);
    if (formattedFiles.length > 0) {
      console.log('File categories:', categorySummary);
      console.log('Total size:', formatFileSize(totalSize));
    }
    
    // Send response
    res.status(200).json({
      success: true,
      message: `Retrieved ${formattedFiles.length} files successfully`,
      count: formattedFiles.length,
      userEmail: finalUserEmail || 'all users',
      files: formattedFiles,
      summary: {
        totalFiles: formattedFiles.length,
        totalSize: totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        categories: categorySummary,
        latestUpload: formattedFiles.length > 0 ? formattedFiles[0].uploadDateFormatted : null
      }
    });
    
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch files",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Alternative function to fetch user files from User model's files array
export const getUserFilesFromUserModel = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Fetching user files from User model...");
    
    // Get user email from request
    let userEmail = req.body.email || (req as any).fields?.email || req.query.email;
    const authUserEmail = (req as any).user?.email;
    
    // Handle array case
    if (Array.isArray(userEmail)) {
      userEmail = userEmail[0];
    }
    
    const finalUserEmail = authUserEmail || userEmail;
    
    if (!finalUserEmail) {
      res.status(400).json({
        success: false,
        message: "User email is required"
      });
      return;
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalUserEmail)) {
      res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
      return;
    }
    
    // Find user and populate files
    const user = await User.findOne({ email: finalUserEmail })
      .populate({
        path: 'files',
        select: '-__v',
        options: { sort: { createdAt: -1 } }
      });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }
    
    console.log(`📧 Found user: ${user.email}`);
    console.log(`📁 User has ${user.files.length} files in their files array`);
    
    // Send response
    res.status(200).json({
      success: true,
      message: `Retrieved ${user.files.length} files from user model`,
      count: user.files.length,
      userEmail: user.email,
      userId: user._id,
      files: user.files,
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        totalFiles: user.files.length
      }
    });
    
  } catch (error) {
    console.error("Error fetching user files from User model:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user files",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Delete file function
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    
    console.log(`🗑️ Deleting file with ID: ${fileId}`);
    
    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      res.status(400).json({
        success: false,
        message: "Invalid file ID format"
      });
      return;
    }
    
    // Find the file first
    const file = await File.findById(fileId);
    
    if (!file) {
      res.status(404).json({
        success: false,
        message: "File not found"
      });
      return;
    }
    
    console.log(`📁 Found file: ${file.name}`);
    console.log(`📧 File owner email: ${file.email}`);
    
    // Delete the physical file from filesystem
    try {
      const fileName = file.url.split('/').pop(); // Get filename from URL
      const filePath = path.join(__dirname, 'files', fileName || '');
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Physical file deleted: ${filePath}`);
      } else {
        console.log(`⚠️ Physical file not found: ${filePath}`);
      }
    } catch (fileDeleteError) {
      console.error("❌ Error deleting physical file:", fileDeleteError);
      // Continue with database deletion even if physical file deletion fails
    }
    
    // Remove file from database
    await File.findByIdAndDelete(fileId);
    console.log(`✅ File removed from database`);
    
    // Remove file from user's files array
    if (file.email) {
      try {
        const user = await User.findOne({ email: file.email });
        if (user) {
          await User.findByIdAndUpdate(
            user._id,
            { $pull: { files: new mongoose.Types.ObjectId(fileId) } }
          );
          console.log(`✅ File removed from user's files array`);
        }
      } catch (userUpdateError) {
        console.error("❌ Error updating user files array:", userUpdateError);
        // Don't fail the entire operation if user update fails
      }
    }
    
    res.status(200).json({
      success: true,
      message: "File deleted successfully",
      deletedFile: {
        id: file._id,
        name: file.name,
        email: file.email
      }
    });
    
  } catch (error) {
    console.error("❌ Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete file",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Serve file directly from local filesystem
export const serveFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    
    console.log(`📁 Serving file: ${fileName}`);
    
    // Construct file path
    const filePath = path.join(__dirname, 'files', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      res.status(404).json({
        success: false,
        message: "File not found"
      });
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Get file extension to determine content type
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    // Set appropriate content type
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.csv': 'text/csv',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    contentType = contentTypes[ext] || 'application/octet-stream';
    
    console.log(`📋 File info: ${fileName}, Size: ${fileSize} bytes, Type: ${contentType}`);
    
    // Set headers for file serving
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error(`❌ Error reading file ${fileName}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error reading file"
        });
      }
    });
    
    fileStream.pipe(res);
    
    console.log(`✅ File served successfully: ${fileName}`);
    
  } catch (error) {
    console.error("❌ Error serving file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to serve file",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get file content for preview (specifically for text files)
export const getFileContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    
    console.log(`📄 Getting content for file: ${fileName}`);
    
    // Construct file path
    const filePath = path.join(__dirname, 'files', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      res.status(404).json({
        success: false,
        message: "File not found"
      });
      return;
    }
    
    // Get file extension
    const ext = path.extname(fileName).toLowerCase();
    
    // Check if it's a text-based file
    const textExtensions = ['.txt', '.md', '.json', '.xml', '.csv', '.js', '.ts', '.html', '.css', '.log'];
    const isTextFile = textExtensions.includes(ext);
    
    if (isTextFile) {
      try {
        // Read file content as text
        const content = fs.readFileSync(filePath, 'utf-8');
        const stats = fs.statSync(filePath);
        
        // Calculate text statistics
        const characterCount = content.length;
        const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
        const lineCount = content.split('\n').length;
        
        console.log(`📊 Text file stats: ${characterCount} chars, ${wordCount} words, ${lineCount} lines`);
        
        res.json({
          success: true,
          fileName,
          fileType: 'text',
          content,
          stats: {
            characterCount,
            wordCount,
            lineCount,
            fileSize: stats.size,
            lastModified: stats.mtime
          }
        });
        
      } catch (readError) {
        console.error(`❌ Error reading text file ${fileName}:`, readError);
        res.status(500).json({
          success: false,
          message: "Error reading file content"
        });
      }
    } else {
      // For non-text files, return file info and URL for direct access
      const stats = fs.statSync(filePath);
      
      res.json({
        success: true,
        fileName,
        fileType: 'binary',
        message: "Binary file - use serve endpoint for direct access",
        serveUrl: `/api/v1/files/serve/${fileName}`,
        stats: {
          fileSize: stats.size,
          lastModified: stats.mtime,
          extension: ext
        }
      });
    }
    
  } catch (error) {
    console.error("❌ Error getting file content:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get file content",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Download file with proper download headers
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    
    console.log(`⬇️ Downloading file: ${fileName}`);
    
    // Construct file path
    const filePath = path.join(__dirname, 'files', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      res.status(404).json({
        success: false,
        message: "File not found"
      });
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Extract original name (remove timestamp)
    const originalName = fileName.replace(/_\d+(\.[^.]+)$/, '$1');
    
    console.log(`📋 Download info: Original: ${originalName}, Size: ${fileSize} bytes`);
    
    // Set headers for forced download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (error) => {
      console.error(`❌ Error downloading file ${fileName}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error downloading file"
        });
      }
    });
    
    fileStream.pipe(res);
    
    console.log(`✅ File download started: ${fileName}`);
    
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download file",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};


