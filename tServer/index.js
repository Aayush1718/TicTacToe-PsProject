import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { WebSocketServer } from "ws";
import { verifyToken } from "./utils/verifyToken.js";
import { handleWSMessage, activeConnections } from "./ws/wsHandlers.js";

dotenv.config();

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    wss.on("connection", async (ws, req) => {
      try {
        const params = new URLSearchParams(req.url.replace("/?", ""));
        const token = params.get("token");

        if (!token) {
          ws.send(JSON.stringify({ type: "error", message: "No token provided" }));
          ws.close();
          return;
        }

        const user = await verifyToken(token);

        if (!user) {
          ws.send(JSON.stringify({ type: "error", message: "Invalid or expired token" }));
          ws.close();
          return;
        }

        activeConnections.set(user._id.toString(), ws);
        console.log(`User connected`);

        ws.send(JSON.stringify({ type: "connection", message: "WebSocket connection established" }));

        ws.on("message", (data) => handleWSMessage(ws, user, data));

        ws.on("close", () => {
          activeConnections.delete(user._id.toString());
          console.log(`User disconnected`);
        });

        ws.on("error", (err) => {
          console.error("WebSocket error:", err.message);
        });

      } catch (err) {
        console.error("Error during WebSocket connection:", err.message);
        ws.close();
      }
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();


