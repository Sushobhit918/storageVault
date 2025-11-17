import express from "express";
import { forgotPassword, resetPassword } from "../controllers/resetController.js";

const router = express.Router();

router.post("/forgot", forgotPassword);
router.put("/reset/:token", resetPassword);

export default router;
