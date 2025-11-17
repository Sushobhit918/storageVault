import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5002;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`File service listening on port ${PORT}`);
  });
})();
