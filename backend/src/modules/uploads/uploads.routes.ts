import path from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Router } from "express";
import { env } from "../../config/env";
import { s3 } from "../../config/s3";
import { authMiddleware } from "../../middleware/auth.middleware";
import { rateLimiters } from "../../middleware/rateLimit.middleware";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIMETYPES,
  MAX_FILE_SIZE,
  sanitizeFilename,
  uploadMiddleware
} from "../../middleware/upload.middleware";
import { asyncHandler } from "../../utils/asyncHandler.utils";
import { errorResponse, successResponse } from "../../utils/response.utils";

export const uploadsRoutes = Router();

uploadsRoutes.post(
  "/",
  authMiddleware,
  rateLimiters.upload,
  uploadMiddleware.single("file"),
  asyncHandler(async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(400).json(errorResponse("UPLOAD_REQUIRED", "No file was uploaded."));
    }

    const extension = path.extname(file.originalname).toLowerCase();
    if (
      file.size > MAX_FILE_SIZE ||
      !ALLOWED_MIMETYPES.includes(file.mimetype) ||
      !ALLOWED_EXTENSIONS.includes(extension)
    ) {
      return res
        .status(400)
        .json(errorResponse("UPLOAD_INVALID", "Uploaded file type or size is not allowed."));
    }

    if (!env.S3_BUCKET_NAME || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      return res
        .status(503)
        .json(errorResponse("STORAGE_NOT_CONFIGURED", "File storage is not configured."));
    }

    const key = `uploads/${sanitizeFilename(file.originalname)}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
      })
    );

    const endpoint = env.S3_ENDPOINT.replace(/\/$/, "");
    const url = endpoint
      ? `${endpoint}/${env.S3_BUCKET_NAME}/${key}`
      : `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/${key}`;

    return res.status(201).json(
      successResponse(
        {
          key,
          url
        },
        "File uploaded."
      )
    );
  })
);
