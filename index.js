const express = require("express");
const multer = require("multer");
const { MozJPEG, Steps, FromBuffer, FromFile } = require("@imazen/imageflow");
const fs = require("fs");
const app = express();
require("dotenv").config();
const API_KEYS = [process.env.API_KEYS]; // Store your valid API keys here
const cors = require("cors");
const {uploadImageToCloudinary} = require("./Uploader/imageuploader");

app.use(
  cors({
    origin: "*",
  })
);

console.log(API_KEYS);
// Multer configuration
const upload = multer({ storage: multer.memoryStorage() }); // Store image in memory

// Route to handle image upload and processing

app.get("/image/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = `./uploads/${filename}`;

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.sendFile(imagePath, { root: __dirname });
  });
});

// Middleware to check API key
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.header("Authorization")?.split(" ")[1]; // Extract key from Authorization header
  if (!apiKey || !API_KEYS.includes(apiKey)) {
    return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
  }
  next(); // Continue to the requested route
};

app.use(authenticateApiKey); // Use this middleware for all routes


app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Get the uploaded file's buffer
    const imageBuffer = req.file.buffer;

    // Process the image using ImageFlow
    const step = new Steps(new FromBuffer(imageBuffer))
      .constrainWithin(1000, 1000) // Resize within 1000x1000
      .branch((step) =>
        step
          .constrainWithin(900, 900) // Resize within 900x900
          .constrainWithin(800, 800) // Resize within 800x800
      );

    // Encode the processed image to a buffer
    const result = await step
      .encode(new FromBuffer(null, "key"), new MozJPEG(80)) // Compress to JPEG with 80% quality
      .execute();

    const processedImageBuffer = result.key;

    // Calculate image size for logging
    const imageSize = Buffer.byteLength(processedImageBuffer);
    console.log(`Processed image size: ${imageSize} bytes`);

    // Upload the processed image buffer to Cloudinary
    const driveUrl = await uploadImageToCloudinary(processedImageBuffer);

    // Send the uploaded image URL as a response
    res.status(200).json({ imageUrl: driveUrl });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process or upload image" });
  }
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
