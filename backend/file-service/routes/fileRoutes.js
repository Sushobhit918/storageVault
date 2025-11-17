import express from "express";
import upload from "../middlewares/upload.js";
import {
  uploadFile,
  getMyFiles,
  getSharedWithMe,
  getFileById,
  updateFile,
  deleteFile,
  shareFile,
  revokeShare
} from "../controllers/fileController.js";

import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// apply auth to all routes
router.use(authMiddleware);

// Upload
router.post("/upload", upload.single("file"), uploadFile);

// List my files
router.get("/", getMyFiles);

// List files shared with me
router.get("/shared-with-me", getSharedWithMe);

// Get single file
router.get("/:id", getFileById);

// Update (metadata or replace file)
router.put("/:id", upload.single("file"), updateFile);

// Delete
router.delete("/:id", deleteFile);

// Share / revoke
router.post("/:id/share", shareFile);      // body: { userId, permission }
router.post("/:id/revoke", revokeShare);  // body: { userId }

export default router;
