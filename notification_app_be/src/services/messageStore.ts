import { messages, Message } from "../data/messages";

/**
 * Message Store Service
 *
 * Pure business logic layer independent of Express/HTTP concerns.
 * These functions encapsulate all operations on message data.
 * 
 * Design Note: Using in-memory array for simplicity in demo.
 * Production migration path: Replace with database queries (PostgreSQL, MongoDB, etc)
 * without changing function signatures—enables clean separation of concerns.
 */

/**
 * getAllMessages: Retrieve all messages from storage
 *
 * Returns the full array. In a real app, this would:
 * - Add pagination (limit, offset)
 * - Add filtering (date range, search terms)
 * - Add sorting options (newest first, most liked, etc)
 */
export function getAllMessages(): Message[] {
  return messages;
}

/**
 * createMessage: Add new message to storage
 *
 * Why Date.now() for ID:
 * ─────────────────────
 * - Simple: No need for UUID library or database sequences
 * - Sortable: IDs increase chronologically with message creation
 * - Unique enough: Collision probability extremely low in practice
 * 
 * In production, would use:
 * - UUID v4: Industry standard, cryptographically unique
 * - Database auto-increment: If using SQL database
 * - MongoDB ObjectId: Built-in BSON type with timestamp
 *
 * Argument uses Omit<Message, "id"> to enforce that ID is generated,
 * not passed in—prevents accidental ID conflicts
 */
export function createMessage(data: Omit<Message, "id">): Message {
  const message: Message = {
    id: Date.now(),
    ...data,
  };
  messages.push(message);
  return message;
}

/**
 * markAsViewed: Update message read status
 *
 * Returns boolean to indicate success/failure:
 * - true if message found and updated
 * - false if message ID doesn't exist (allows caller to return 404)
 *
 * Why immutable update pattern:
 * ──────────────────────────────
 * Even though this is in-memory and not truly immutable,
 * the pattern prevents accidental mutations and scales to database:
 * - Easier to add audit logging later
 * - Facilitates future optimistic locking (version fields)
 * - Clearer intent: "create new object with change" vs "mutate existing"
 */
export function markAsViewed(id: number): boolean {
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return false; // Message not found
  
  // Create new message object with read=true instead of mutating
  messages[index] = { ...messages[index], read: true };
  return true;
}
