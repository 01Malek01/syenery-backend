import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "social-media-app",
    allowedFormats: ["jpg", "png", "jpeg"], // Allowed image formats
    public_id: (req, file) => file.originalname,
  },
});

export const upload = multer({ storage: storage });
