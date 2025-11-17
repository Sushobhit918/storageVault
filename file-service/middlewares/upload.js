import multer from "multer";

// use memory storage for microservice (upload stream to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB default
});

export default upload;
