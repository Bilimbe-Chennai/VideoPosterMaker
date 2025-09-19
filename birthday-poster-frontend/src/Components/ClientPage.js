import { useRef, useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardMedia,
  Fade,
  alpha,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import {
  PhotoCamera,
  WhatsApp,
  CloudUpload,
  CheckCircle,
} from "@mui/icons-material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import useAxios from "../useAxios";
import { useParams } from "react-router-dom";
export default function ClientPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [gender, setGender] = useState("Female1");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [genderOptions, setGenderOptions] = useState([
    "Female1",
    "Female2",
    "Female3",
    "Female4",
    "Male1",
    "Male2",
    "Male3",
    "Male4",
    "Child Male1",
    "Child Male2",
    "Child Male3",
    "Child Male4",
    "Child Female1",
    "Child Female2",
    "Child Female3",
    "Child Female4",
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [adminSetting, setAdminSetting] = useState();
  const axiosData = useAxios();
  const theme = useTheme();
  const { eventName, id } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const fileInputRef = useRef(null); // 👈 add this
  // 🔹 Fetch events from adminsettings when page loads
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosData.get(`admin/getone/${id}`);
        if (res.data) {
          setAdminSetting(res.data); // expecting [{name: "..."}]
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Could not load event list. Please try again.");
      }
    };
    fetchEvents();
  }, []);
  const handleSubmit = () => {
    setSuccess("");
    if (!whatsapp || !photo) {
      setError("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("whatsapp", whatsapp);
    formData.append("photo", photo);
    formData.append("EventId", id);
    formData.append("gender", gender);
    // ✅ Show success message immediately (without waiting)
    setError("");
    setSuccess(
      "Your video is being processed and will be sent to your WhatsApp!"
    );
    setWhatsapp("");
    setPhoto(null);
    setPreviewUrl("");
    // reset the actual file input 👇
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    axiosData
      .post("client/client-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .catch((err) => {
        console.error("Upload failed:", err);
        setError("Error submitting details. Please try again.");
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      //   if (file.size > 5 * 1024 * 1024) {
      //     setError("File size should be less than 5MB");
      //     return;
      //   }

      setPhoto(file);
      setError("");

      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffcdd2 0%, #b71c1c 100%)",
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          width: isMobile ? "100%" : isTablet ? "90%" : "80%",
          transition: "all 0.3s ease",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: isMobile ? 2 : { sm: 3, md: 4 },
            borderRadius: 3,
            background: "white",
            boxShadow: "0 8px 32px rgba(183, 28, 28, 0.2)",
          }}
        >
          <Grid
            container
            sx={{ justifyContent: "center" }}
            spacing={isMobile ? 2 : 4}
          >
            {/* Left side - Form */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    color: "#d32f2f",
                    textAlign: isMobile ? "center" : "left",
                  }}
                >
                  Client Submission
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, textAlign: isMobile ? "center" : "left" }}
                >
                  Submit your details to receive your personalized video via
                  WhatsApp
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}
                <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="WhatsApp Number"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91XXXXXXXXXX"
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WhatsApp sx={{ color: "#d32f2f" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "#d32f2f",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#d32f2f",
                      },
                    }}
                  />
                  {/* <TextField
                    select
                    fullWidth
                    label="Select Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleAltIcon sx={{ color: "#d32f2f" }} />
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
                    {genderOptions.length > 0 ? (
                      genderOptions.map((ev, idx) => (
                        <MenuItem key={idx} value={ev}>
                          {ev.includes("1")
                            ? `${ev.replace("1", "")} Model 1`
                            : ev.includes("2")
                            ? `${ev.replace("2", "")} Model 2`
                            : ev.includes("3")
                            ? `${ev.replace("3", "")} Model 3`
                            : `${ev.replace("4", "")} Model 4`}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>Loading...</MenuItem>
                    )}
                  </TextField> */}
                  <Autocomplete
                    fullWidth
                    options={genderOptions}
                    value={gender}
                    onChange={(e, newValue) => setGender(newValue)}
                    getOptionLabel={(ev) => {
                      if (!ev) return "";
                      if (ev.includes("1"))
                        return `${ev.replace("1", "")} Model 1`;
                      if (ev.includes("2"))
                        return `${ev.replace("2", "")} Model 2`;
                      if (ev.includes("3"))
                        return `${ev.replace("3", "")} Model 3`;
                      if (ev.includes("4"))
                        return `${ev.replace("4", "")} Model 4`;
                      return ev;
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Gender"
                        margin="normal"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <PeopleAltIcon sx={{ color: "#d32f2f" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mb: isMobile ? 2 : 3,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    )}
                  />
                </Box>
                <Box sx={{ mt: 2, mb: 3 }}>
                  <input
                    ref={fileInputRef} // 👈 attach ref
                    accept="image/*"
                    style={{ display: "none" }}
                    id="photo-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      startIcon={<PhotoCamera />}
                      sx={{
                        py: isMobile ? 1 : 1.5,
                        borderStyle: "dashed",
                        borderWidth: 2,
                        borderColor: photo ? "#4caf50" : "#d32f2f",
                        backgroundColor: photo
                          ? alpha("#4caf50", 0.08)
                          : "transparent",
                        color: photo ? "#4caf50" : "#d32f2f",
                        "&:hover": {
                          borderColor: photo ? "#4caf50" : "#b71c1c",
                          backgroundColor: photo
                            ? alpha("#4caf50", 0.12)
                            : alpha("#d32f2f", 0.08),
                        },
                      }}
                    >
                      {photo ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CheckCircle sx={{ mr: 1, color: "#4caf50" }} />
                          <Typography variant="body2" noWrap>
                            {photo.name}
                          </Typography>
                        </Box>
                      ) : (
                        "Upload Your Photo"
                      )}
                    </Button>
                  </label>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Supported formats: JPG, PNG, WEBP.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size={isMobile ? "medium" : "large"}
                  onClick={handleSubmit}
                  disabled={loading || !whatsapp || !photo}
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <CloudUpload />
                  }
                  sx={{
                    py: isMobile ? 1 : 1.5,
                    mt: "auto",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)",
                    boxShadow: "0 3px 5px 2px rgba(183, 28, 28, .3)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #b71c1c 30%, #9a0007 90%)",
                    },
                    "&:disabled": {
                      background: "#e0e0e0",
                      boxShadow: "none",
                    },
                  }}
                >
                  {loading ? "Processing..." : "Submit"}
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2, display: "block", textAlign: "center" }}
                >
                  Your photo will be used to create a personalized video message
                  that will be sent to your WhatsApp number.
                </Typography>
              </Box>
            </Grid>

            {/* Right side - Preview */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#d32f2f", fontWeight: "bold" }}
                >
                  Photo Preview
                </Typography>

                {previewUrl ? (
                  <Fade in={true} timeout={1000}>
                    <Card
                      sx={{
                        maxWidth: isMobile ? 280 : 345,
                        width: "100%",
                        border: "2px solid #ffcdd2",
                      }}
                    >
                      <CardMedia
                        component="img"
                        height={isMobile ? 250 : 370}
                        image={previewUrl}
                        alt="Preview"
                        sx={{ objectFit: "cover" }}
                      />
                    </Card>
                  </Fade>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: isMobile ? 280 : 345,
                      height: isMobile ? 250 : 370,
                      border: "2px dashed",
                      borderColor: "#ffcdd2",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff5f5",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      Your photo will appear here
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "center", px: isMobile ? 1 : 0 }}
                >
                  {isMobile
                    ? "Upload a clear photo for best results"
                    : "Make sure your face is clearly visible for optimal video processing"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#d32f2f", fontWeight: "bold" }}
                >
                  Sample Output Video
                </Typography>

                {adminSetting ? (
                  <Fade in={true} timeout={1000}>
                    <Card
                      sx={{
                        maxWidth: isMobile ? 280 : 345,
                        width: "100%",
                        border: "2px solid #ffcdd2",
                      }}
                    >
                      <CardMedia
                        component="video"
                        height={370}
                        src={
                          gender === "Male1"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId1}`
                            : gender === "Female1"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId1}`
                            : gender === "Child Male1"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId1}`
                            : gender === "Child Female1"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId1}`
                            : gender === "Male2"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId2}`
                            : gender === "Female2"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId2}`
                            : gender === "Child Male2"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId2}`
                            : gender === "Child Female2"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId2}`
                            : gender === "Male3"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId3}`
                            : gender === "Female3"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId3}`
                            : gender === "Child Male3"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId3}`
                            : gender === "Child Female3"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId3}`
                            : gender === "Male4"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId4}`
                            : gender === "Female4"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId4}`
                            : gender === "Child Male4"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId4}`
                            : gender === "Child Female4"
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId4}`
                            : `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.video1Id}`
                        }
                        controls
                        autoPlay
                        loop
                        muted
                        sx={{ objectFit: "contain" }}
                      />
                    </Card>
                  </Fade>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: isMobile ? 280 : 345,
                      height: isMobile ? 250 : 370,
                      border: "2px dashed",
                      borderColor: "#ffcdd2",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fff5f5",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      Output video sample will appear here
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "center", px: isMobile ? 1 : 0 }}
                >
                  {isMobile
                    ? "This is a sample preview of your video."
                    : "Preview how your final video will look once processing is complete."}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
