import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import resetRoutes from "./routes/resetRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.enable("trust proxy"); 
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Database connect
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/password", resetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
