import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { MessageHubPage } from "./pages/MessageHubPage";

function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#faf5ff" }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: "#d946ef" }}>
        <Toolbar>
          <ChatIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Message Central
          </Typography>
        </Toolbar>
      </AppBar>
      <MessageHubPage />
    </Box>
  );
}

export default App;
