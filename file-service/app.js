import express from "express";
import cors from "cors";
import fileRoutes from "./routes/fileRoutes.js";
import './config/redisClient.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/files", fileRoutes);

// health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// error handler (basic)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Server error" });
});

export default app;
