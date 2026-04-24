import crypto from "node:crypto";
import multer from "multer";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Unsupported file type."));
      return;
    }

    file.originalname = `${crypto.randomUUID()}-${file.originalname}`;
    callback(null, true);
  }
});

