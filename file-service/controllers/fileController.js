import cloudinary from "../config/cloudinary.js";
import File from "../models/File.js";
import axios from "axios";
import redis from "../config/redisClient.js"; // This line was already here

/*
 Helper: upload buffer to cloudinary using upload_stream
*/
const uploadBufferToCloud = (buffer, opts = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });

// Upload file (owner = req.user.id)
export const uploadFile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!req.file) return res.status(400).json({ message: "File missing" });

    const { originalname, mimetype, size, buffer } = req.file;

    const result = await uploadBufferToCloud(buffer, {
      folder: "drive-files",
        resource_type: "auto"
    });

    // Create inline view URL (PDF opens in browser)
    const viewUrl = result.secure_url.replace(
      "/upload/",
      "/upload/fl_inline/"
    );

    const fileDoc = await File.create({
      ownerId: userId,
      fileName: originalname,
      url: result.secure_url,   // download link
      viewUrl: viewUrl,         // browser view link (PDF)
      public_id: result.public_id,
      mimeType: mimetype,
      size,
    });

    // --- REDIS LOGIC ---
    // Invalidate the cache for this user's file list
    await redis.del(`files:user:${userId}`);
    // --- END REDIS LOGIC ---

    return res.status(201).json({ message: "Uploaded", file: fileDoc });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Upload failed", error: err.message });
  }
};


// Get files owned by user
export const getMyFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // --- REDIS LOGIC ---
    const cacheKey = `files:user:${userId}`;
    const cachedFiles = await redis.get(cacheKey);

    if (cachedFiles) {
      console.log("CACHE HIT: Serving user files from cache");
      return res.json(JSON.parse(cachedFiles));
    }
    // --- END REDIS LOGIC ---

    // Cache miss, get from DB
    console.log("CACHE MISS: Serving user files from database");
    const files = await File.find({ ownerId: userId }).sort({ createdAt: -1 });

    // --- REDIS LOGIC ---
    // Save to cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(files), "EX", 3600);
    // --- END REDIS LOGIC ---

    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get files shared with me
export const getSharedWithMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await File.find({ "sharedWith.userId": userId }).sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single file if owner or shared (read)
export const getFileById = async (req, res) => {
  try {
    const userId = req.user.id;
    const fileId = req.params.id;
    
    // --- REDIS LOGIC ---
    const cacheKey = `file:${fileId}`;
    const cachedFile = await redis.get(cacheKey);

    if (cachedFile) {
      console.log("CACHE HIT: Serving single file from cache");
      const file = JSON.parse(cachedFile);
      
      // We must still check permissions on the cached file
      const isOwner = file.ownerId === userId;
      const shared = file.sharedWith.find(s => s.userId === userId);

      if (isOwner || shared) {
        return res.json(file);
      }
      return res.status(403).json({ message: "Access denied" });
    }
    // --- END REDIS LOGIC ---

    // Cache miss, get from DB
    console.log("CACHE MISS: Serving single file from database");
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    const isOwner = file.ownerId === userId;
    const shared = file.sharedWith.find(s => s.userId === userId);

    if (isOwner || shared) {
      // --- REDIS LOGIC ---
      // Save to cache for 1 hour
      await redis.set(cacheKey, JSON.stringify(file), "EX", 3600);
      // --- END REDIS LOGIC ---
      return res.json(file);
    }
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update metadata (rename) or replace file
export const updateFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    const isOwner = file.ownerId === userId;
    const sharedEdit = file.sharedWith.find(s => s.userId === userId && s.permission === "edit");

    if (!isOwner && !sharedEdit) return res.status(403).json({ message: "No edit permission" });

    // If a new file is uploaded, replace on Cloudinary
    if (req.file) {
      // delete old
      try {
        await cloudinary.uploader.destroy(file.public_id, { resource_type: "auto" });
      } catch (e) {
        console.warn("Cloudinary delete failed:", e.message);
      }
      const result = await uploadBufferToCloud(req.file.buffer, {
        folder: "drive-files",
        resource_type: "auto",
      });

      file.url = result.secure_url;
      file.public_id = result.public_id;
      file.mimeType = req.file.mimetype;
      file.size = req.file.size;
      file.fileName = req.file.originalname;
    }

    // metadata updates (e.g., rename)
    if (req.body.name) file.fileName = req.body.name;


    await file.save();

    // --- REDIS LOGIC ---
    // Invalidate caches
    await redis.del(`file:${file.id}`); // Invalidate the single file cache
    await redis.del(`files:user:${file.ownerId}`); // Invalidate the owner's list
    // --- END REDIS LOGIC ---

    res.json({ message: "File updated", file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete file (owner only)
export const deleteFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    if (file.ownerId !== userId) return res.status(403).json({ message: "Only owner can delete" });

    // delete from cloudinary
    try {
      await cloudinary.uploader.destroy(file.public_id, { resource_type: "auto" });
    } catch (e) {
      console.warn("Cloudinary destroy failed:", e.message);
    }

    // --- REDIS LOGIC ---
    // Invalidate caches before deleting
    await redis.del(`file:${file.id}`);
    await redis.del(`files:user:${file.ownerId}`);
    // --- END REDIS LOGIC ---

    await file.deleteOne();
    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*
 Share/unshare endpoints:
*/
export const shareFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: targetUserId, permission } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.ownerId !== userId) return res.status(403).json({ message: "Only owner can share" });

    const idx = file.sharedWith.findIndex(s => s.userId === targetUserId);
    if (idx >= 0) file.sharedWith[idx].permission = permission;
    else file.sharedWith.push({ userId: targetUserId, permission });

    await file.save();

    // --- REDIS LOGIC ---
    // Invalidate caches because the 'sharedWith' array has changed
    await redis.del(`file:${file.id}`);
    await redis.del(`files:user:${file.ownerId}`);
    // --- END REDIS LOGIC ---

    // Notify WebSocket microservice
    await axios.post("http://localhost:6000/api/ws/notify-file-shared", {
      targetUserId,
      file: {
        id: file._id,
        name: file.fileName,
        permission
      }
    });

    res.json({ message: "Shared", file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const revokeShare = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: targetUserId } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });
    if (file.ownerId !== userId) return res.status(403).json({ message: "Only owner can revoke" });

    file.sharedWith = file.sharedWith.filter(s => s.userId !== targetUserId);
    await file.save();

    // --- REDIS LOGIC ---
    // Invalidate caches because the 'sharedWith' array has changed
    await redis.del(`file:${file.id}`);
    await redis.del(`files:user:${file.ownerId}`);
    // --- END REDIS LOGIC ---

    // Notify WebSocket microservice
    await axios.post("http://localhost:6001/api/ws/notify-file-revoked", {
      targetUserId,
      fileId: file._id
    });

    res.json({ message: "Revoked", file });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};