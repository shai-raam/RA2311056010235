import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import MailIcon from "@mui/icons-material/Mail";
import { Message } from "../types";
import { Log } from "logging_middleware";

interface Props {
  message: Message;
  onMarkAsRead: (id: number) => void;
}

export function MessageTile({ message, onMarkAsRead }: Props) {
  useEffect(() => {
    Log("frontend", "debug", "component", `MessageTile rendered for id ${message.id}`);
  }, [message.id]);

  const handleMarkAsRead = async () => {
    await Log("frontend", "info", "component", `user clicked mark as read for ${message.id}`);
    onMarkAsRead(message.id);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: message.read ? "4px solid #a0aec0" : "4px solid #d946ef",
        opacity: message.read ? 0.65 : 1,
        transition: "all 0.3s ease",
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <MailIcon
            sx={{ color: message.read ? "#9ca3af" : "#d946ef" }}
            fontSize="small"
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {message.title}
          </Typography>
          <Chip
            label={message.read ? "Seen" : "New"}
            size="small"
            color={message.read ? "default" : "primary"}
            icon={message.read ? <CheckIcon /> : undefined}
            sx={{
              backgroundColor: message.read ? "#e5e7eb" : "#d946ef",
              color: message.read ? "#4b5563" : "#fff",
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {message.message}
        </Typography>
      </CardContent>
      {!message.read && (
        <CardActions>
          <Button size="small" onClick={handleMarkAsRead} variant="outlined">
            Mark Seen
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
