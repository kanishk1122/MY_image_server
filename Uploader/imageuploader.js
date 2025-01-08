import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
  cloud_name: 'drqnhnref',
  api_key: process.env.CLOUD_DAIRY_API_KEY,
  api_secret: process.env.CLOUD_DAIRY_API_SECRET ,
});

const uploadImageToCloudinary = async (imageBuffer) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }).end(imageBuffer); // Ensure buffer ends properly
    });
  };
  


export {uploadImageToCloudinary}