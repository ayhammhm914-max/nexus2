import crypto from "node:crypto";
import path from "node:path";
import multer from "multer";

export const ALLOWED_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = new Set(ALLOWED_MIMETYPES);
const allowedExtensions = new Set(ALLOWED_EXTENSIONS);

export const sanitizeFilename = (filename: string) => {
  const extension = path.extname(filename).toLowerCase();
  return `${crypto.randomBytes(8).toString("hex")}${extension}`;
};

export const uploadMiddleware = multer({
  // Memory storage prevents attackers from writing arbitrary files to local disk.
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    // MIME type and extension are both checked because either one can be spoofed alone.
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Unsupported file type."));
      return;
    }

    if (!allowedExtensions.has(extension)) {
      callback(new Error("Unsupported file extension."));
      return;
    }

    callback(null, true);
  }
});
