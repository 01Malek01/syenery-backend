import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "social-media-app",
    allowedFormats: ["jpg", "png", "jpeg"], // Allowed image formats
    public_id: (req, file) => file.originalname,
  },
});

export const upload = multer({ storage });
