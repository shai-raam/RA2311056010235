import { useEffect } from "react";
import { Container, Grid, Typography, Box } from "@mui/material";
import { useMessageBoard } from "../hooks/useMessageBoard";
import { MessageBoard } from "../components/MessageBoard";
import { PostMessageForm } from "../components/PostMessageForm";
import { Log } from "logging_middleware";

export function MessageHubPage() {
  const { messages, loading, error, addMessage, markAsRead, reload } =
    useMessageBoard();

  useEffect(() => {
    Log("frontend", "info", "page", "user just loaded the message hub page");
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Message Central
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Share and track your messages in real time
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <PostMessageForm onSubmit={addMessage} />
        </Grid>
        <Grid item xs={12} md={7}>
          <MessageBoard
            messages={messages}
            loading={loading}
            error={error}
            onMarkAsRead={markAsRead}
            onRefresh={reload}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
