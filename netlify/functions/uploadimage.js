import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: "drqnhnref",
  api_key: process.env.CLOUD_DAIRY_API_KEY,
  api_secret: process.env.CLOUD_DAIRY_API_SECRET,
});

export const handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { imageBase64 } = body;

    // Check if the imageBase64 data is provided
    if (!imageBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image data provided" }),
      };
    }


    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBase64}`, {
      resource_type: "image",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: uploadResult.secure_url,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
