import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    // console.log("File-Service Received Header:", authHeader);

    const token = authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Missing token" });

    // Call auth service using HEADER, not body
    const resp = await axios.get(process.env.AUTH_SERVICE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 3000
    });

    if (!resp.data || !resp.data.valid) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = resp.data.user;
    next();

  } catch (err) {
    console.log("Auth Service Error:", err.response?.data || err.message);

    if (err.code === "ECONNABORTED" || err.code === "ECONNREFUSED") {
      return res.status(503).json({ message: "Auth service unavailable" });
    }

    return res.status(err.response?.status || 401).json(
      err.response?.data || { message: "Unauthorized" }
    );
  }
};
