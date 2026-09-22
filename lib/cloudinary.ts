import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImage = async (
  file: Buffer,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: Record<string, unknown>;
  } = {}
): Promise<{ url: string; public_id: string; width: number; height: number; format: string }> => {
  const { folder = "attari-store/products", public_id, transformation } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        transformation: transformation || {
          quality: "auto:good",
          fetch_format: "auto",
          width: 1200,
          height: 1200,
          crop: "limit",
        },
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        } else {
          reject(new Error("Upload failed - no result"));
        }
      }
    );

    uploadStream.end(file);
  });
};

export const deleteImage = async (public_id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const deleteImages = async (public_ids: string[]): Promise<void> => {
  if (public_ids.length === 0) return;
  
  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(public_ids, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const getOptimizedUrl = (
  public_id: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string => {
  const { width, height, crop = "fill", quality = "auto:good", format = "auto" } = options;
  
  return cloudinary.url(public_id, {
    transformation: [
      { width, height, crop, quality, fetch_format: format },
    ],
    secure: true,
  });
};

export default cloudinary;