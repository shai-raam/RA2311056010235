import { Request, Response } from "express";
import {
  getAllMessages,
  createMessage,
  markAsViewed,
} from "../services/messageStore";
import { Log } from "../logger";

/**
 * Message Controller
 *
 * Handlers bridge HTTP layer (Express Request/Response) and business logic (services).
 * Responsible for:
 * - Request validation (checking required fields)
 * - HTTP status code selection
 * - Response formatting
 * - Error handling
 * 
 * Services remain independent of HTTP concerns—can be reused in CLI, webhooks, etc.
 */

/**
 * GET /messages
 * ─────────────
 * Retrieve all messages from storage
 */
export async function getMessages(req: Request, res: Response) {
  try {
    await Log("backend", "info", "handler", "just grabbed all the messages");
    const data = getAllMessages();
    await Log("backend", "info", "handler", `returning ${data.length} messages back to client`);
    res.json(data); // HTTP 200 (default)
  } catch (error) {
    // Log unexpected errors
    await Log("backend", "error", "handler", "oops, couldn't fetch the messages");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

/**
 * POST /messages
 * ──────────────
 * Create new message with validation
 *
 * Request body validation:
 * - title: Required, string
 * - message: Required, string
 * 
 * Returns:
 * - 201 Created: Successfully created message with full object
 * - 400 Bad Request: Missing required fields
 * - 500 Server Error: Unexpected database/server error
 */
export async function postMessage(req: Request, res: Response) {
  try {
    await Log("backend", "info", "handler", "starting to create a new message");
    const { title, message } = req.body;

    /**
     * Validation: Both title and message required
     * 
     * Early return pattern:
     * - Send response immediately when validation fails
     * - Prevents further processing of invalid data
     * - Clear error message for client
     */
    if (!title || !message) {
      await Log("backend", "warn", "handler", "someone sent incomplete data - missing title or message");
      res.status(400).json({ error: "title and message are required" });
      return; // Exit handler here
    }

    // Create message with default read=false (unread)
    const newMessage = createMessage({ title, message, read: false });
    await Log("backend", "info", "handler", `successfully saved message with id ${newMessage.id}`);
    
    // 201 Created standard: Return full created resource with id
    res.status(201).json(newMessage);
  } catch (error) {
    await Log("backend", "error", "handler", "couldn't save the new message");
    res.status(500).json({ error: "Failed to create message" });
  }
}

/**
 * PATCH /messages/:id
 * ───────────────────
 * Update single message (mark as read)
 *
 * Why PATCH instead of PUT:
 * - PATCH: Partial update (only read status)
 * - PUT: Full replace (would require entire message object)
 * 
 * Returns:
 * - 200 OK: Successfully marked as read
 * - 404 Not Found: Message ID doesn't exist
 * - 500 Server Error: Unexpected error
 */
export async function patchMessage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await Log("backend", "info", "handler", `marking message ${id} as viewed`);

    // Attempt to update message, service returns boolean success
    const success = markAsViewed(id);

    /**
     * 404 Pattern: Not Found
     * Client sent ID that doesn't exist in database.
     * Service returns false to indicate resource doesn't exist.
     */
    if (!success) {
      await Log("backend", "warn", "handler", `message ${id} doesn't exist`);
      res.status(404).json({ error: "Message not found" });
      return; // Exit handler
    }

    await Log("backend", "info", "handler", `message ${id} is now marked as read`);
    res.json({ success: true }); // HTTP 200 OK
  } catch (error) {
    await Log("backend", "error", "handler", "failed to mark message as viewed");
    res.status(500).json({ error: "Failed to update message" });
  }
}
