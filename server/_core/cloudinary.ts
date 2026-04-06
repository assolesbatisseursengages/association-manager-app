import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.cloudinaryCloudName,
  api_key: ENV.cloudinaryApiKey,
  api_secret: ENV.cloudinaryApiSecret,
});

export interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  resource_type: string;
  type: string;
  bytes: number;
  width?: number;
  height?: number;
  format: string;
  created_at: string;
}

/**
 * Upload a file to Cloudinary
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name of the file (used as public_id)
 * @param folder - The folder in Cloudinary to store the file
 * @returns The upload result
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "association-manager"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as CloudinaryUploadResult);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @returns The deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
}

/**
 * Get a signed URL for a file in Cloudinary
 * @param publicId - The public ID of the file
 * @returns The signed URL
 */
export function getCloudinaryUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
  });
}

/**
 * Transform a Cloudinary URL with specific parameters
 * @param publicId - The public ID of the file
 * @param transformations - The transformations to apply
 * @returns The transformed URL
 */
export function getTransformedCloudinaryUrl(
  publicId: string,
  transformations?: Record<string, any>
): string {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations,
  });
}

export default cloudinary;
