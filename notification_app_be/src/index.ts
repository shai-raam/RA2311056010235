import "dotenv/config";
import express from "express";
import cors from "cors";
import messageRoutes from "./routes/messageRoutes";
import { Log } from "./logger";

const app = express();
const PORT = 3000;

/**
 * Middleware Pipeline Architecture
 *
 * Order matters: Timestamp logging runs first to capture all requests,
 * CORS allows cross-origin requests from frontend, JSON parsing enables
 * request body reading, debug logging sends structured logs to evaluation service
 */

// Timestamp logger: Logs ISO timestamp + method + path for audit trail
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Enable CORS to allow frontend (port 5173) to communicate with backend (port 3000)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

/**
 * Debug logging middleware
 * Sends every incoming request to evaluation service for monitoring.
 * Uses async/await but doesn't block request processing if logging fails.
 * This graceful degradation ensures app continues even if logging service is down.
 */
app.use(async (req, _res, next) => {
  await Log("backend", "debug", "handler", `${req.method} ${req.path} incoming`);
  next();
});

// Route handlers
app.use("/", messageRoutes);

// Start server and log startup
app.listen(PORT, async () => {
  await Log("backend", "info", "service", `message service started on port ${PORT}`);
  console.log(`🚀 Message Central running on port ${PORT}`);
});
