import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { handleShareFileEvent } from "./controllers/wsController.js";
import { authenticateWS } from "./utils/authenticate.js";

dotenv.config();

const PORT = process.env.WS_PORT || 6000;

const wss = new WebSocketServer({ port: PORT });

const clients = new Map(); // userId -> ws connection(s)

wss.on("connection", (ws, req) => {
  try {
    // URLSearchParams se token nikalna safe
    const url = new URL(`http://localhost${req.url}`);
    const token = url.searchParams.get("token");

    const user = authenticateWS(token);
    if (!user) {
      ws.close(4001, "Invalid token");
      return;
    }

    console.log(`User connected: ${user.id}`);

    if (!clients.has(user.id)) clients.set(user.id, []);
    clients.get(user.id).push(ws);

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.event === "shareFile") {
          await handleShareFileEvent(data.payload, clients);
        }
      } catch (err) {
        console.error("WS message error:", err.message);
      }
    });

    ws.on("close", () => {
      console.log(`User disconnected: ${user.id}`);
      clients.set(user.id, clients.get(user.id)?.filter(c => c !== ws) || []);
    });

  } catch (err) {
    console.error("WS connection error:", err.message);
    ws.close(1011, "Server error");
  }
});