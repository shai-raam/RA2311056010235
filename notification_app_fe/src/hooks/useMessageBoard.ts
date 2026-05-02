import { useState, useEffect, useCallback, useRef } from "react";
import {
  getMessages,
  postMessage,
  setMessageRead,
} from "../api/messageApi";
import { Message, NewMessagePayload } from "../types";
import { Log } from "logging_middleware";

/**
 * Custom React Hook: useMessageBoard
 *
 * Encapsulates all message-related state management and API interactions.
 * This allows components to focus solely on rendering UI while the hook
 * handles data fetching, mutations, and error handling.
 *
 * Key Pattern: useRef(mounted) to prevent race conditions
 * ─────────────────────────────────────────────────────
 * In React StrictMode (development), useEffect runs twice on mount to help
 * catch side effects. Without the mounted check, this causes duplicate API
 * calls. The useRef stores a mutable value that persists across renders,
 * allowing us to track whether we've already loaded messages.
 *
 * Alternative approaches and why we chose useRef:
 * ❌ if (messages.length === 0) → Fails: doesn't work on first render
 * ❌ if (!loading) → Fails: loading state isn't set yet on first render
 * ✅ useRef(mounted) → Works: persists across render cycles
 */
export function useMessageBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mutable ref that persists across renders - used to track mount status
  const mounted = useRef(false);

  /**
   * loadMessages: Fetch all messages from server
   * Uses useCallback to memoize this function, which prevents unnecessary
   * re-renders of components that depend on it (via dependency arrays)
   */
  const loadMessages = useCallback(async () => {
    await Log("frontend", "debug", "hook", "loading my messages from server");
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages();
      setMessages(data);
      await Log("frontend", "info", "hook", `loaded ${data.length} messages total`);
    } catch {
      setError("Couldn't load messages");
      await Log("frontend", "error", "hook", "message loading failed");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initialization Effect
   * ─────────────────────
   * Runs once on mount (after the mounted ref check prevents double-runs).
   * Loads initial message list from server.
   * 
   * Why we need the mounted ref:
   * - Without it: Effect runs twice, causes two identical API calls
   * - With it: First render sees mounted=false, sets it to true, loads messages
   *           Second render (in StrictMode) sees mounted=true, skips loading
   */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      loadMessages();
    }
  }, [loadMessages]);

  /**
   * addMessage: Create new message and update local state
   * Uses optimistic update pattern (update UI before server response)
   * in case future server doesn't always return the new message
   */
  const addMessage = useCallback(
    async (payload: NewMessagePayload) => {
      await Log("frontend", "info", "hook", "adding a new message");
      try {
        const newMessage = await postMessage(payload);
        setMessages((prev) => [...prev, newMessage]);
        await Log("frontend", "info", "hook", "new message added to my list");
      } catch {
        await Log("frontend", "error", "hook", "couldn't add that message");
        throw new Error("Couldn't add message");
      }
    },
    []
  );

  /**
   * markAsRead: Toggle message read status and update local cache
   * Uses immutable update pattern to maintain React's state integrity:
   * Creates new array with single message updated, avoids direct mutation
   */
  const markAsRead = useCallback(async (id: number) => {
    await Log("frontend", "info", "hook", `marking message ${id} as read`);
    try {
      await setMessageRead(id);
      // Immutable update: create new array with updated message
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
      await Log("frontend", "info", "hook", `message ${id} updated in my list`);
    } catch {
      await Log("frontend", "error", "hook", `couldn't mark message ${id} as read`);
      throw new Error("Couldn't mark as read");
    }
  }, []);

  // Export hook state and methods for components
  return {
    messages,
    loading,
    error,
    addMessage,
    markAsRead,
    reload: loadMessages, // Expose reload for refresh button in UI
  };
}
