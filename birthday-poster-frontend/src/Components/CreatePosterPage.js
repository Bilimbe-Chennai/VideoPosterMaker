import React, { useState, useRef } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ThemeProvider,
  createTheme,
  Alert,
} from "@mui/material";
import {
  Movie,
  Image,
  Gif,
  PhotoCamera,
  Videocam,
  CalendarToday,
  PersonOutline,
  Category,
  CloudUpload,
  Download,
  PlayArrow,
  Pause,
  Close,
  AutoAwesome,
  Palette,
  LinearScale,
  List,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import useAxios from "../useAxios";
import { styled } from "@mui/material/styles";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
const GradientButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #D32F2F 0%, #B71C1C 100%)",
  color: "white",
  fontWeight: 700,
  padding: "12px 24px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(211, 47, 47, 0.4)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 20px rgba(183, 28, 28, 0.6)",
    background: "linear-gradient(45deg, #D32F2F 10%, #B71C1C 100%)",
  },
  "&:disabled": {
    background:
      "linear-gradient(45deg, rgba(216, 135, 135, 1) 0%, #d77272ff 100%)",
    boxShadow: "none",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  overflow: "hidden",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
  },
}));

const FileUploadBox = styled(Box)(({ theme }) => ({
  border: "2px dashed #d32f2f",
  borderRadius: "12px",
  padding: theme.spacing(2),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  backgroundColor: "rgb(237 153 153 / 23%)",
  "&:hover": {
    borderColor: "#D32F2F",
    backgroundColor: "#fff",
  },
}));
// Create red theme
const redTheme = createTheme({
  palette: {
    primary: {
      main: "#d32f2f", // Deep red
    },
    secondary: {
      main: "#f44336", // Lighter red
    },
  },
});
function CreatePosterPage() {
  const axiosData = useAxios();
  const [qrCode, setQrCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mediaType, setMediaType] = useState("photogif");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    type: "",
    photo: null,
    gif: null,
    video: null,
    video1: null,
    video2: null,
    audio: null,
  });
  const [fileNames, setFileNames] = useState({
    photo: "",
    gif: "",
    video: "",
    video1: "",
    video2: "",
    audio: "",
  });
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setFileNames((prev) => ({ ...prev, [name]: files[0].name }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveFile = (fileType) => {
    setFormData((prev) => ({ ...prev, [fileType]: null }));
    setFileNames((prev) => ({ ...prev, [fileType]: "" }));
  };
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPhoneNumber("");
  };
  const handleMediaTypeChange = (e) => {
    setMediaType(e.target.value);
    setFormData({
      name: "",
      date: new Date().toISOString().split("T")[0],
      type: "",
      photo: null,
      gif: null,
      video: null,
      audio: null,
    });
    setFileNames({  photo: "",
    gif: "",
    video: "",
    video1: "",
    video2: "",
    audio: "", });
    setMedia(null);
  };

  const shareOnWhatsApp = async () => {
    const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}?download=true`; // replace with your download link

    if (!phoneNumber.trim()) {
      alert("Please enter a WhatsApp number.");
      return;
    }

    const formattedNumber = phoneNumber.replace(/\D/g, "");
    const message = `Hey! Download this file here: ${downloadUrl}`;
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(
      message
    )}`;
    try {
      setLoading(true);
      const res = await axiosData.post(
        "upload/share",
        {
          mobile: formattedNumber,
          _id: media._id,
          link: downloadUrl,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (res) {
        setLoading(false);
        closeModal();
        setSuccess(true);
      }
    } catch (err) {
      setLoading(false);
      console.error("Share error:", err);
      closeModal();
    }
    //window.open(whatsappUrl, "_blank");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMedia(null);
    setUploading(true);
    try {
      const uploadData = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val) uploadData.append(key, val);
      });
      // Append the mediaType to the form data
      uploadData.append("type", mediaType);
      const endpoint = `upload/${mediaType}`;
      const res = await axiosData.post(endpoint, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMedia(res.data.media);
      setQrCode(res.data.qrCode);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Check server and FFmpeg setup.");
    } finally {
      setUploading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderFileUploads = () => {
    const uploadOptions = {
      videovideo: [
        {
          name: "video1",
          label: "Upload First Video",
          icon: <Videocam />,
          accept: "video/*",
        },
        {
          name: "video2",
          label: "Upload Second Video",
          icon: <Videocam />,
          accept: "video/*",
        },
      ],
      photogif: [
        {
          name: "photo",
          label: "Upload Photo",
          icon: <PhotoCamera />,
          accept: "image/*",
        },
        {
          name: "gif",
          label: "Upload GIF",
          icon: <Gif />,
          accept: "image/gif",
        },
      ],
      videophoto: [
        {
          name: "video",
          label: "Upload Video",
          icon: <Videocam />,
          accept: "video/*",
        },
        {
          name: "photo",
          label: "Upload Photo",
          icon: <PhotoCamera />,
          accept: "image/*",
        },
      ],
    };

    return uploadOptions[mediaType].map((input) => (
      <Grid item xs={12} md={6} key={input.name}>
        <FileUploadBox sx={{ width: 200 }}>
          <input
            type="file"
            name={input.name}
            id={input.name}
            hidden
            onChange={handleChange}
            accept={input.accept}
          />
          <label
            htmlFor={input.name}
            style={{ width: "50%", cursor: "pointer" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(211, 47, 47, 0.2)",
                  color: "#b92828",
                  width: 25,
                  height: 25,
                  mb: 0.5,
                  p: 0.4,
                }}
              >
                {input.icon}
              </Avatar>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {input.label}
              </Typography>
              <Typography variant="caption">
                {input.accept.includes("video")
                  ? "MP4, MOV, AVI"
                  : input.accept.includes("gif")
                  ? "GIF format"
                  : "JPG, PNG"}
              </Typography>
            </Box>
          </label>
          {fileNames[input.name] && (
            <Fade in={true}>
              <Chip
                label={fileNames[input.name]}
                onDelete={() => handleRemoveFile(input.name)}
                deleteIcon={<Close />}
                sx={{
                  mt: 2,
                  backgroundColor: "rgba(211, 47, 47, 0.2)",
                  color: "#b92828",
                  border: "1px solid rgba(211, 47, 47, 0.5)",
                  borderRadius: "8px",
                  height: "auto",
                  py: 0.5,
                }}
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: "rgba(225, 116, 116, 0.3)",
                      color: "#b92828",
                      "& .MuiSvgIcon-root": {
                        // This targets the icon specifically
                        color: "#b92828", // Ensures the icon inherits the color
                      },
                    }}
                  >
                    {input.icon}
                  </Avatar>
                }
              />
            </Fade>
          )}
        </FileUploadBox>
      </Grid>
    ));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 1.5 }}>
        {/* Header Section */}
        <Box
          sx={{
            textAlign: "center",
            mb: 1,
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              mb: 1,
              px: 4,
              py: 1,
              borderRadius: "16px",
              background: "rgba(211, 47, 47, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(211, 47, 47, 0.1)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #D32F2F 0%, #B71C1C 100%)",
              },
            }}
          >
            <AutoAwesome
              sx={{
                fontSize: 36,
                mr: 2,
                color: "#D32F2F",
                filter: "drop-shadow(0 0 8px rgba(211, 47, 47, 0.7))",
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#d2000b",
                letterSpacing: "-0.5px",
              }}
            >
              Video Poster Generator
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              maxWidth: 600,
              mx: "auto",
              color: "#616161",
            }}
          >
            Transform your media into stunning video poster
          </Typography>
        </Box>
        <Grid
          container
          spacing={3}
          sx={{ display: "flex", justifyContent: "space-evenly" }}
        >
          {/* Left Column - Form */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: "16px",
                width: 500,
                background: "white",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(211, 47, 47, 0.1)",
                boxShadow: "0 8px 32px rgba(196, 29, 29, 0.1)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Palette
                  sx={{
                    fontSize: 32,
                    mr: 2,
                    color: "#D32F2F",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#D32F2F",
                  }}
                >
                  Create New Video
                </Typography>
              </Box>
              <Divider
                sx={{
                  mb: 1.5,
                  borderColor: "rgba(211, 47, 47, 0.1)",
                }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel
                  id="media-type-label"
                  sx={{
                    color: "#616161",
                    "&.Mui-focused": {
                      color: "#D32F2F",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Category
                      sx={{
                        mr: 1.5,
                        fontSize: 24,
                        color: "#D32F2F",
                      }}
                    />
                    Type
                  </Box>
                </InputLabel>
                <Select
                  labelId="media-type-label"
                  value={mediaType}
                  label="Media Type"
                  onChange={handleMediaTypeChange}
                  sx={{
                    color: "#212121",
                    "& .MuiSelect-select": {
                      display: "flex",
                      alignItems: "center",
                      py: 1.5,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(211, 47, 47, 0.2)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D32F2F",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#D32F2F",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#D32F2F",
                    },
                  }}
                >
                  <MenuItem value="photogif">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Image sx={{ mr: 1.5, color: "#D32F2F" }} />
                      <Typography>Photo + GIF</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="videophoto">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Videocam sx={{ mr: 1.5, color: "#D32F2F" }} />
                      <Typography>Video + Photo</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="videovideo">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Videocam sx={{ mr: 1.5, color: "#D32F2F" }} />
                      <Typography>Video + Video</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  name="name"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PersonOutline
                        sx={{
                          mr: 1.5,
                          fontSize: 24,
                          color: "#D32F2F",
                        }}
                      />
                      Project Name
                    </Box>
                  }
                  fullWidth
                  required
                  onChange={handleChange}
                  variant="outlined"
                  size="medium"
                  value={formData.name}
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": {
                      color: "#616161",
                    },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      color: "#212121",
                      "& fieldset": {
                        borderColor: "rgba(211, 47, 47, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#D32F2F",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#D32F2F",
                      },
                    },
                  }}
                />

                {/* <TextField
                  name="date"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarToday
                        sx={{
                          mr: 1.5,
                          fontSize: 24,
                          color: "#D32F2F",
                        }}
                      />
                      Date
                    </Box>
                  }
                  type="date"
                  fullWidth
                  required
                  onChange={handleChange}
                  variant="outlined"
                  size="medium"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date}
                  sx={{
                    mb: 1,
                    "& .MuiInputLabel-root": {
                      color: "#616161",
                    },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      color: "#212121",
                      "& fieldset": {
                        borderColor: "rgba(211, 47, 47, 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#D32F2F",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#D32F2F",
                      },
                    },
                  }}
                /> */}

                <Grid
                  container
                  spacing={4}
                  sx={{
                    mb: 1,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                  }}
                >
                  {renderFileUploads()}
                </Grid>
                {/* NEW: Audio Upload (only if mediaType is video) */}
                {mediaType === "videovideo" && (
                  <Grid item xs={12} md={6} sx={{ mb: 1, ml: 1.5 }}>
                    <FileUploadBox sx={{ width: 200 }}>
                      <input
                        id="upload-audio"
                        type="file"
                        name="audio"
                        accept="audio/*,.mp3,.m4a,.aac,.wav"
                        hidden
                        onChange={handleChange}
                      />
                      <label
                        htmlFor="upload-audio"
                        style={{ width: "50%", cursor: "pointer" }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            mr: 0.8,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "rgba(211, 47, 47, 0.2)",
                              color: "#b92828",
                              width: 25,
                              height: 25,
                              mb: 0.5,
                              p: 0.4,
                            }}
                          >
                            <AudiotrackIcon />
                          </Avatar>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Upload Audio
                          </Typography>
                          <Typography variant="caption">{"(MP3)"}</Typography>
                        </Box>
                      </label>
                      {fileNames["audio"] && (
                        <Fade in={true}>
                          <Chip
                            label={fileNames["audio"]}
                            onDelete={() => handleRemoveFile("audio")}
                            deleteIcon={<Close />}
                            sx={{
                              mt: 2,
                              backgroundColor: "rgba(211, 47, 47, 0.2)",
                              color: "#b92828",
                              border: "1px solid rgba(211, 47, 47, 0.5)",
                              borderRadius: "8px",
                              height: "auto",
                              py: 0.5,
                            }}
                            avatar={
                              <Avatar
                                sx={{
                                  bgcolor: "rgba(225, 116, 116, 0.3)",
                                  color: "#b92828",
                                  "& .MuiSvgIcon-root": {
                                    // This targets the icon specifically
                                    color: "#b92828", // Ensures the icon inherits the color
                                  },
                                }}
                              >
                                <AudiotrackIcon />
                              </Avatar>
                            }
                          />
                        </Fade>
                      )}
                    </FileUploadBox>
                  </Grid>
                )}
                <GradientButton
                  sx={{ mb: 1 }}
                  type="submit"
                  disabled={
                    uploading ||
                    !formData.name ||
                    !formData.date ||
                    (mediaType === "videovideo" &&
                      (!formData.video1 ||
                        !formData.video2 ||
                        !formData.audio)) ||
                    (mediaType === "photogif" &&
                      (!formData.photo || !formData.gif)) ||
                    (mediaType === "videophoto" &&
                      (!formData.video || !formData.photo))
                  }
                  startIcon={<CloudUpload sx={{ fontSize: 24 }} />}
                  fullWidth
                >
                  {uploading ? (
                    <>
                      <CircularProgress
                        size={24}
                        sx={{ mr: 2, color: "white" }}
                      />
                      Creating Magic...
                    </>
                  ) : (
                    `Generate ${mediaType
                      .replace("video", "Video")
                      .replace("gif", "GIF")
                      .replace("photo", "Photo")}`
                  )}
                </GradientButton>
              </Box>
            </Box>
          </Grid>

          {/* Right Column - Preview */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 2,
                width: 500,
                borderRadius: "16px",
                height: "100%",
                background: "white",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(211, 47, 47, 0.1)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                >
                  <AutoAwesome
                    sx={{
                      fontSize: 32,
                      mr: 2,
                      color: "#D32F2F",
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "#D32F2F",
                    }}
                  >
                    Output Video
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  component={Link}
                  to="/view-all-posters"
                  startIcon={<List />}
                >
                  View All
                </Button>
              </Box>
              <Divider
                sx={{
                  mb: 1.5,
                  borderColor: "rgba(211, 47, 47, 0.1)",
                }}
              />

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "12px",
                  backgroundColor: "rgba(211, 47, 47, 0.03)",
                  border: "2px dashed rgba(211, 47, 47, 0.1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {uploading && (
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 2,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "12px",
                      maxWidth: 400,
                    }}
                  >
                    <CircularProgress
                      size={80}
                      thickness={4}
                      sx={{
                        color: "#D32F2F",
                        mb: 3,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#212121",
                      }}
                    >
                      Creating your masterpiece
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#616161" }}>
                      Our AI is working its magic...
                    </Typography>
                  </Box>
                )}

                {!media && !uploading && (
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 4,
                      maxWidth: 400,
                    }}
                  >
                    <Box
                      sx={{
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        backgroundColor: "rgba(211, 47, 47, 0.1)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mx: "auto",
                        mb: 3,
                        border: "2px dashed rgba(211, 47, 47, 0.3)",
                      }}
                    >
                      <Image
                        sx={{
                          fontSize: 60,
                          color: "rgba(211, 47, 47, 0.5)",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 1,
                        fontWeight: 600,
                        color: "#212121",
                      }}
                    >
                      Your visual masterpiece awaits
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#616161" }}>
                      Configure your settings and generate a preview
                    </Typography>
                  </Box>
                )}

                {(media?.posterVideoId || media?.mergedVideoId) && (
                  <Fade in={true} timeout={500}>
                    <StyledCard>
                      <Box sx={{ position: "relative" }}>
                        {/* <CardMedia
                          component="img"
                          image={mediaType === "videovideo"?`https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}`:`https://api.bilimbebrandactivations.com/api/upload/file/${media?.photoId}`}
                          alt="Poster Preview"
                          sx={{
                            width: "100%",
                            maxHeight: 250,
                            objectFit: "contain",
                          }}
                        /> */}
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: 250,
                          }}
                        >
                          <video
                            controls
                            //poster={`https://api.bilimbebrandactivations.com/api/upload/file/${media?.photoId}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              backgroundColor: "#a91111ff",
                            }}
                          >
                            <source
                              src={
                                mediaType === "videophoto"
                                  ? `https://api.bilimbebrandactivations.com/api/upload/file/${media?.mergedVideoId}`
                                  : `https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}`
                              }
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                          {/* <IconButton
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              backgroundColor: "rgba(0,0,0,0.5)",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.7)",
                              },
                            }}
                          >
                            <PlayArrow fontSize="large" />
                          </IconButton> */}
                        </Box>
                        {/* <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "flex-end",
                            p: 3,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ color: "white", fontWeight: 600 }}
                          >
                            {formData.name || "Your Poster"}
                          </Typography>
                        </Box> */}
                      </Box>
                      <CardContent
                        sx={{
                          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-evenly",
                              }}
                            >
                              <Button
                                variant="contained"
                                href={
                                  mediaType === "videophoto"
                                    ? `https://api.bilimbebrandactivations.com/api/upload/file/${media?.mergedVideoId}?download=true`
                                    : `https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}?download=true`
                                }
                                download="final-video.mp4"
                                sx={{
                                  background:
                                    "linear-gradient(45deg, #D32F2F 0%, #B71C1C 100%)",
                                  color: "white",
                                  borderRadius: "8px",
                                  py: 1.5,
                                  fontWeight: 600,
                                  boxShadow: "none",
                                  "&:hover": {
                                    boxShadow:
                                      "0 4px 15px rgba(183, 28, 28, 0.4)",
                                  },
                                  width: "100%",
                                }}
                                startIcon={<Download />}
                              >
                                Download Video
                              </Button>
                              <div style={{ margin: "10px" }}>
                                <IconButton
                                  onClick={openModal}
                                  style={{
                                    color: "white",
                                    backgroundColor: "green",
                                  }}
                                >
                                  <WhatsAppIcon />
                                </IconButton>
                              </div>
                            </Box>
                            {mediaType === "videophoto" && (
                              <Button
                                variant="contained"
                                href={`https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterId}?download=true`}
                                download="final-video.mp4"
                                sx={{
                                  background:
                                    "linear-gradient(45deg, #D32F2F 0%, #B71C1C 100%)",
                                  color: "white",
                                  borderRadius: "8px",
                                  py: 1.5,
                                  mt: 2,
                                  fontWeight: 600,
                                  boxShadow: "none",
                                  "&:hover": {
                                    boxShadow:
                                      "0 4px 15px rgba(183, 28, 28, 0.4)",
                                  },
                                  width: "100%",
                                }}
                                startIcon={<Download />}
                              >
                                Download Poster
                              </Button>
                            )}
                            {media?.qrCode && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <img src={media?.qrCode} alt="Download QR Code" />
                              </div>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </StyledCard>
                  </Fade>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Modal */}
      {/* {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h3>Enter WhatsApp Number</h3>
            <input
              type="text"
              placeholder="e.g. 919876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              style={{
                padding: "10px",
                width: "100%",
                marginBottom: "15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
            <div>
              <button
                onClick={shareOnWhatsApp}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#25D366",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  marginRight: "10px",
                }}
              >
                Share
              </button>
              <button
                onClick={closeModal}
                style={{
                  padding: "10px 15px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: "5px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
      {showModal && (
        <ThemeProvider theme={redTheme}>
          <Dialog
            open={showModal}
            onClose={closeModal}
            PaperProps={{
              sx: {
                borderRadius: "12px",
                width: "350px",
                padding: "16px",
              },
            }}
          >
            <DialogTitle
              sx={{
                color: "primary.main",
                fontWeight: "bold",
                textAlign: "center",
                padding: "16px 16px 8px",
              }}
            >
              Enter WhatsApp Number
            </DialogTitle>

            <DialogContent sx={{ padding: "8px 16px" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="e.g. 919876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                sx={{
                  marginTop: "8px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", padding: "16px" }}>
              <Button
                onClick={closeModal}
                variant="outlined"
                sx={{
                  color: "text.primary",
                  borderColor: "text.secondary",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  marginRight: "16px",
                  "&:hover": {
                    borderColor: "text.primary",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={shareOnWhatsApp}
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: "8px",
                  padding: "8px 24px",
                  fontWeight: "bold",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    boxShadow: "none",
                  },
                }}
              >
                {loading ? 'Sending...' : 'Share'}
              </Button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>
      )}
      {success && (
        <ThemeProvider theme={redTheme}>
          <Dialog
            open={success}
            PaperProps={{
              sx: {
                borderRadius: "12px",
                width: "350px",
                padding: "16px",
              },
            }}
          >
            <DialogTitle
              sx={{
                color: "#2e7d32",
                fontWeight: "bold",
                textAlign: "center",
                p: 2,
              }}
            >
              Message Sent!
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <Alert
                severity="success"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setSuccess(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
              >
                Your video download link has been successfully sent to{" "}
                {phoneNumber}
              </Alert>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", p: 2 }}>
              <Button
                onClick={() => {
                  setSuccess(false);
                }}
                variant="contained"
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#2e7d32",
                  "&:hover": { backgroundColor: "#1b5e20" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>
      )}
    </Box>
  );
}

export default CreatePosterPage;
