// Storage helpers using Cloudinary
// Replaces the Manus Forge storage proxy

import { v2 as cloudinary } from 'cloudinary';

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials missing: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  getCloudinaryConfig();

  const key = relKey.replace(/^\/+/, "");
  const publicId = key.replace(/\.[^/.]+$/, ""); // remove extension for public_id

  // Convert data to base64 for upload
  let base64Data: string;
  if (typeof data === "string") {
    base64Data = Buffer.from(data).toString("base64");
  } else {
    base64Data = Buffer.from(data).toString("base64");
  }

  const dataUri = `data:${contentType};base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: `batisseurs/${publicId}`,
    resource_type: "auto",
    use_filename: true,
    unique_filename: true,
  });

  return {
    key: result.public_id,
    url: result.secure_url,
  };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  getCloudinaryConfig();

  const key = relKey.replace(/^\/+/, "");
  
  // Generate a secure URL for the resource
  const url = cloudinary.url(key, {
    secure: true,
    resource_type: "auto",
  });

  return { key, url };
}
