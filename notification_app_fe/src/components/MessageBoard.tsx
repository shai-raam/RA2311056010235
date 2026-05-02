import { useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Message } from "../types";
import { MessageTile } from "./MessageTile";
import { Log } from "logging_middleware";

interface Props {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onMarkAsRead: (id: number) => void;
  onRefresh: () => void;
}

export function MessageBoard({
  messages,
  loading,
  error,
  onMarkAsRead,
  onRefresh,
}: Props) {
  const unread = messages.filter((m) => !m.read).length;

  useEffect(() => {
    Log("frontend", "debug", "component", `MessageBoard rendered with ${messages.length} items`);
  }, [messages.length]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="h6">Messages</Typography>
        {unread > 0 && (
          <Chip 
            label={`${unread} new`} 
            size="small"
            sx={{
              backgroundColor: "#d946ef",
              color: "#fff",
            }}
          />
        )}
        <Tooltip title="Refresh messages">
          <IconButton size="small" onClick={onRefresh} sx={{ ml: "auto" }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {messages.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          py={6}
          color="text.secondary"
        >
          <MailOutlineIcon sx={{ fontSize: 48, mb: 1, color: "#d946ef" }} />
          <Typography>No messages yet - write your first one!</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {messages.map((message) => (
            <MessageTile
              key={message.id}
              message={message}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
