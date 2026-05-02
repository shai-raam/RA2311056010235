import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { NewMessagePayload } from "../types";
import { Log } from "logging_middleware";

interface Props {
  onSubmit: (payload: NewMessagePayload) => Promise<void>;
}

export function PostMessageForm({ onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Log("frontend", "debug", "component", "PostMessageForm mounted");
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      await Log("frontend", "warn", "component", "form submitted with missing fields");
      setError("Both fields are required");
      return;
    }

    setSubmitting(true);
    setError(null);
    await Log("frontend", "info", "component", "user submitted message form");

    try {
      await onSubmit({ title: title.trim(), message: message.trim() });
      await Log("frontend", "info", "component", "message submitted successfully via form");
      setTitle("");
      setMessage("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setError("Couldn't post that message");
      await Log("frontend", "error", "component", "message form submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Post Something
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Message posted! 🎉
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          label="Title"
          placeholder="What's on your mind?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="small"
          disabled={submitting}
        />
        <TextField
          label="Message"
          placeholder="Share your thoughts..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          multiline
          rows={3}
          size="small"
          disabled={submitting}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={<SendIcon />}
          sx={{ 
            alignSelf: "flex-start",
            backgroundColor: "#d946ef",
            "&:hover": {
              backgroundColor: "#c026d3",
            }
          }}
        >
          {submitting ? "Posting..." : "Post Message"}
        </Button>
      </Box>
    </Paper>
  );
}
