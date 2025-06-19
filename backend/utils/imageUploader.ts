import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// Define the function with proper type annotations
export const uploadImageToCloudinary = async (
  file: any, // ideally, you can replace `any` with a specific type from your file upload lib (like express-fileupload)
  folder: string,
  height?: number,
  quality?: number
): Promise<UploadApiResponse> => {
  const options: {
    folder: string;
    height?: number;
    quality?: number;
    resource_type: "auto" | "image" | "video" | "raw";
  } = { folder, resource_type: "auto" };

  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }

  return await cloudinary.uploader.upload(file.tempFilePath, options);
};
