import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  InputAdornment,
  Grid,
  MenuItem,
  useTheme,
  useMediaQuery,
Typography,
  Alert,
} from "@mui/material";
import { CloudUpload, Event } from "@mui/icons-material";
import useAxios from "../useAxios";
import { useNavigate } from "react-router-dom"; 
export default function EventLoginPage() {
  const [eventName, setEventName] = useState("");
  const [eventOptions, setEventOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const axiosData = useAxios();
const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // 🔹 Fetch events from adminsettings when page loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosData.get("admin/settings");
        if (res.data && Array.isArray(res.data)) {
          setEventOptions(res.data); // expecting [{name: "..."}]
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Could not load event list. Please try again.");
      }
    };
    fetchEvents();
  }, []);

  const handleSubmit = async () => {
    setSuccess("");
    setError("");

    if (!eventName) {
      setError("Please select an event name");
      return;
    }

    const formData = new FormData();
    formData.append("EventName", eventName);

    try {
      setLoading(true);
      // ✅ Show success immediately
      setSuccess("Event name set successfully!");
      setEventName("");
        const selectedEvent = eventOptions.find((data) => data.name === eventName);
        const dataId = selectedEvent ? selectedEvent._id : null;
      navigate(`/client/${eventName}/${dataId}`);
    //   await axiosData.post("client/client-upload", formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Error submitting details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffebee 0%, #b71c1c 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: isMobile ? 1.5 : 4,
      }}
    >
      <Container
        maxWidth={isMobile ? "xs" : isTablet ? "sm" : "md"}
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Paper
          elevation={8}
          sx={{
            p: isMobile ? 3 : 5,
            borderRadius: 4,
            background: "white",
            width: "100%",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 12px 40px rgba(183, 28, 28, 0.3)",
          }}
        >
          {/* Title */}
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#b71c1c" }}
          >
            🎉 Event Login
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "subtitle1"}
            sx={{ mb: isMobile ? 2 : 3, color: "gray" }}
          >
            Please select your event to continue
          </Typography>

          {/* Dropdown */}
          <TextField
            select
            fullWidth
            label="Select Event"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            margin="normal"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Event sx={{ color: "#d32f2f" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: isMobile ? 2 : 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            {eventOptions.length > 0 ? (
              eventOptions.map((ev, idx) => (
                <MenuItem key={idx} value={ev.name}>
                  {ev.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Loading events...</MenuItem>
            )}
          </TextField>

          {/* Button */}
          <Button
            variant="contained"
            fullWidth
            size={isMobile ? "medium" : "large"}
            onClick={handleSubmit}
            disabled={loading || !eventName}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
            sx={{
              py: isMobile ? 1 : 1.5,
              fontSize: isMobile ? "0.9rem" : "1rem",
              fontWeight: "bold",
              borderRadius: 3,
              background: "linear-gradient(45deg, #d32f2f 30%, #9a0007 90%)",
              "&:hover": {
                background: "linear-gradient(45deg, #b71c1c 30%, #7f0000 90%)",
              },
            }}
          >
            {loading ? "Processing..." : "Submit"}
          </Button>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
              {success}
            </Alert>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
