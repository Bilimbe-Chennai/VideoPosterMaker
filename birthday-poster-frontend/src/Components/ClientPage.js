import { useRef, useState, useEffect, useMemo } from "react";
import axios from "axios";
// Add these imports
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Tooltip from '@mui/material/Tooltip';
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
  Select,
  FormControl,
  InputLabel,
  Checkbox,
} from "@mui/material";
import {
  PhotoCamera,
  WhatsApp,
  CloudUpload,
  CheckCircle,
  Download,
} from "@mui/icons-material";
import { PlayArrow, Pause, VolumeOff, VolumeUp } from "@mui/icons-material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "../App.css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import useAxios from "../useAxios";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
export default function ClientPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [gender, setGender] = useState("Female1");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("video1.mp4");
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
  const [clientName, setClientName] = useState("");
  const [success, setSuccess] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [adminSetting, setAdminSetting] = useState();
  const axiosData = useAxios();
  const theme = useTheme();
  const { eventName, id } = useParams();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const fileInputRef = useRef(null); // 👈 add this
  const swiperRef = useRef(null);
  const videoRefs = useRef([]);
  const startXRef = useRef(0);
  const movedRef = useRef(false);
  const [playingStates, setPlayingStates] = useState({});
  const [progressStates, setProgressStates] = useState({});
  const [getOutput, setGetOutput] = useState({});
  // console.log("getoutput",getOutput)
  const [mutedStates, setMutedStates] = useState({});
  const [showOutputVideo, setShowOutputVideo] = useState(false);
  const progressRef = useRef(null);
  const isVideoVideoVideoType = adminSetting?.type === "videovideovideo";
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
  // Toggle play/pause on click (per video)
  const handleVideoClick = (index) => {
    const v = videoRefs.current[index];
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlayingStates((prev) => ({ ...prev, [index]: true }));
    } else {
      v.pause();
      setPlayingStates((prev) => ({ ...prev, [index]: false }));
    }
  };
  // useEffect(() => {
  //   // Ensure autoplay happens (muted required for many browsers)
  //   if (videoRefs.current) {
  //     videoRefs.current.muted = muted;
  //     // try autoplay
  //     const p = videoRefs.current.play();
  //     if (p && p.then) p.catch(() => {}); // swallow autoplay rejection
  //   }
  // }, [muted, previewUrl]);
  // Time update (update progress + playing state)
  const onTimeUpdate = (index) => {
    const v = videoRefs.current[index];
    if (!v || !v.duration) return;
    setProgressStates((prev) => ({
      ...prev,
      [index]: (v.currentTime / v.duration) * 100,
    }));
    setPlayingStates((prev) => ({ ...prev, [index]: !v.paused }));
  };

  // Progress click (seek)
  const onProgressClick = (e, index) => {
    const v = videoRefs.current[index];
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = v.duration * pct;
    setProgressStates((prev) => ({ ...prev, [index]: pct * 100 }));
  };

  // Toggle mute
  const toggleMute = (e, index) => {
    e.stopPropagation();
    setMutedStates((prev) => {
      const next = !prev[index];
      if (videoRefs.current[index]) videoRefs.current[index].muted = next;
      return { ...prev, [index]: next };
    });
  };
  const videoMap = {
    Female1: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId1}`,
    Female2: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId2}`,
    Female3: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId3}`,
    Female4: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.girlVideoId4}`,
    Male1: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId1}`,
    Male2: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId2}`,
    Male3: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId3}`,
    Male4: `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.boyVideoId4}`,
    "Child Male1": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId1}`,
    "Child Male2": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId2}`,
    "Child Male3": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId3}`,
    "Child Male4": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childBoyVideoId4}`,
    "Child Female1": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId1}`,
    "Child Female2": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId2}`,
    "Child Female3": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId3}`,
    "Child Female4": `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.childGirlVideoId4}`,
  };

  const videoUrl =
    videoMap[gender] ||
    `https://api.bilimbebrandactivations.com/api/upload/file/${adminSetting?.video1Id}`;
  const keys = Object.keys(videoMap);

  const handleCheckboxChange = (key) => {
    setSelectedVideo(key);
    setGender(key);
  };
  const handleSubmit = () => {
    setSuccess("");
    // Different validation based on type
    if (isVideoVideoVideoType) {
      // For videovideovideo: require name and whatsapp only (no photo/gender)
      if (!clientName || !whatsapp) {
        setError("Please enter your name and WhatsApp number");
        return;
      }
    } else {
      // For other types: original validation
      if (!whatsapp || !photo) {
        setError("Please fill all fields");
        return;
      }
    }
    setShowOutputVideo(false);
    setLoading(true);
    const formData = new FormData();
    formData.append("whatsapp", whatsapp);
    if (isVideoVideoVideoType) {
      // For videovideovideo, send name instead of photo/gender
      formData.append("clientName", clientName);
    } else {
      // For other types, send photo and gender
      if (photo) formData.append("photo", photo);
      formData.append("gender", gender);
    }
    formData.append("EventId", id);
    //formData.append("gender", gender);
    // ✅ Show success message immediately (without waiting)
    // setError("");
    // setSuccess(
    //  isVideoVideoVideoType
    //     ? "Your personalized video is being generated and will be sent to your WhatsApp!"
    //     : "Your video is being processed and will be sent to your WhatsApp!"
    // );
    // setWhatsapp("");
    // setClientName("");
    // setPhoto(null);
    // setPreviewUrl("");
    // // reset the actual file input 👇
    // if (fileInputRef.current) {
    //   fileInputRef.current.value = "";
    // }
    axiosData
      .post("client/client-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        // Handle different response structures
        if (isVideoVideoVideoType) {
          // videovideovideo: Immediate success response
          if (response.data.success) {
            setSuccess(`✅ Video sent to ${whatsapp}!`);
            setGetOutput(response.data.media);
            setShowOutputVideo(true);
            setWhatsapp("");
            setClientName("");
          } else {
            setError(response.data.error || "Submission failed");
          }
        } else {
          // Other types: 202 Accepted response
          if (response.status === 202) {
            setSuccess(
              "✅ Upload received! Video is being processed and will be sent to your WhatsApp."
            );
            setWhatsapp("");
            setPhoto(null);
            setPreviewUrl("");
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else if (response.data.error) {
            setError(response.data.error);
          }
        }
      })
      .catch((err) => {
        console.error("Upload failed:", err);
        setError("Error submitting details. Please try again.");
      })
      .finally(() => {
        setLoading(false);
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
  const slides = useMemo(
    () =>
      genderOptions.map((key, index) => (
        <SwiperSlide key={`${key}-${index}`}>
          <Box
            sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}
          >
            {/* wrapper with touch-action so browser doesn't steal horizontal gestures */}
            {/* <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,        // above video
          touchAction: "pan-y", // allow vertical scrolling
        }}
      /> */}
            <video
              ref={(el) => (videoRefs.current[index] = el)} // 👈 assign ref per index
              src={videoMap[key]}
              controls={false} // using custom controls so native controls won't block swipe
              playsInline
              preload="metadata"
              onTimeUpdate={() => onTimeUpdate(index)}
              onClick={() => handleVideoClick(index)}
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <Box
              onClick={() => {
                const vid = videoRefs.current[index];
                if (!vid) return;

                if (vid.paused) {
                  vid.play().catch(() => {});
                } else {
                  vid.pause();
                }
              }}
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
                // 👉 IMPORTANT: allow Swiper to still detect horizontal drags
                touchAction: "pan-y",
              }}
            />
            {/* Checkbox overlay (top-right) — interactive but small so it won't block most swipes */}
            <Checkbox
              checked={selectedVideo === key}
              onChange={() => handleCheckboxChange(key)}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(255,255,255,0.85)",
                borderRadius: "50%",
                zIndex: 20,
                // allow clicking the checkbox but keep rest of area swipeable
              }}
              className="swiper-no-swiping" // 👈 so checkbox doesn’t trigger swipe
            />
            <Box
              sx={{
                position: "absolute",
                left: 8,
                right: 8,
                bottom: 8,
                zIndex: 40,
                display: "flex",
                alignItems: "center",
                gap: 1,
                background: "rgba(0,0,0,0.35)",
                borderRadius: 2,
                padding: "6px 8px",
                height: 40,
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoClick(index);
                }}
                sx={{ color: "white" }}
              >
                {playingStates[index] ? (
                  <Pause fontSize="small" />
                ) : (
                  <PlayArrow fontSize="small" />
                )}
              </IconButton>

              <Box
                onClick={(e) => onProgressClick(e, index)}
                sx={{
                  flex: 1,
                  height: 6,
                  bgcolor: "rgba(255,255,255,0.25)",
                  borderRadius: 1,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${progressStates[index] || 0}%`,
                    bgcolor: "primary.main",
                  }}
                />
              </Box>

              <IconButton
                size="small"
                onClick={(e) => toggleMute(e, index)}
                sx={{ color: "white" }}
              >
                {mutedStates[index] ? (
                  <VolumeOff fontSize="small" />
                ) : (
                  <VolumeUp fontSize="small" />
                )}
              </IconButton>
            </Box>
          </Box>
        </SwiperSlide>
      )),
    [genderOptions, videoMap, selectedVideo, handleCheckboxChange] // only rebuild when these change
  );

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
          width: isMobile ? "100%" : isTablet ? "90%" : isVideoVideoVideoType?"100%":"90%",
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
            spacing={isMobile ? 2 : 5}
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
                    textAlign: isMobile ? "center" : "center",
                  }}
                >
                  {isVideoVideoVideoType
                    ? "Personalized Video Request"
                    : "Client Submission"}
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, textAlign: isMobile ? "center" : "center" }}
                >
                  {isVideoVideoVideoType
                    ? "Enter your details to receive a personalized video with your name"
                    : "Submit your details to receive your personalized video via WhatsApp"}
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
                <Box sx={{ display: "flex", flexDirection: isVideoVideoVideoType?"column":"row", gap: 2 }}>
                  {isVideoVideoVideoType ? (
                    <>
                      {" "}
                      <TextField
                        fullWidth
                        label="Your Name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter your name"
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
                    </>
                  ) : (
                    <>
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
                            label="Selected Gender Model"
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
                    </>
                  )}
                </Box>
                {/* Only show video slider for non-videovideovideo types */}
                {!isVideoVideoVideoType && (
                  <Box sx={{ textAlign: "center", position: "relative" }}>
                    {/* Video Slider with Animation */}
                    <Swiper
                      onSwiper={(s) => (swiperRef.current = s)}
                      modules={[Navigation, Pagination]}
                      navigation={{
                        prevEl: ".custom-prev",
                        nextEl: ".custom-next",
                      }}
                      pagination={{ clickable: true }}
                      spaceBetween={20}
                      grabCursor={true}
                      slidesPerView={4}
                      breakpoints={{
                        320: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1200: { slidesPerView: 4 },
                      }}
                      style={{ borderRadius: 10, padding: "10px 40px" }}
                    >
                      {slides}
                      {/* Custom arrows (same as you wanted) */}
                      <IconButton
                        className="custom-prev"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: 6,
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(211,47,47,0.9)",
                          color: "white",
                          zIndex: 30,
                          "&:hover": { bgcolor: "rgba(211,47,47,1)" },
                        }}
                      >
                        <ArrowBackIos fontSize="small" />
                      </IconButton>

                      <IconButton
                        className="custom-next"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          right: 6,
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(211,47,47,0.9)",
                          color: "white",
                          zIndex: 30,
                          "&:hover": { bgcolor: "rgba(211,47,47,1)" },
                        }}
                      >
                        <ArrowForwardIos fontSize="small" />
                      </IconButton>
                    </Swiper>

                    {/* <Swiper
                    spaceBetween={30}
                    slidesPerView={4}
                    style={{ borderRadius: "10px" }}
                  >
                    {genderOptions.map((key, index) => (
                      <SwiperSlide key={key}>
                        <Box sx={{ position: "relative" }}>
              
                          <video
                            src={videoMap[key]}
                            controls
                            autoPlay
                            style={{
                              width: "100%",
                              maxHeight: "500px",
                              borderRadius: "10px",
                            }}
                          />

                         
                          <Checkbox
                            checked={selectedVideo.includes(key)}
                            onChange={() => handleCheckboxChange(key)}
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              bgcolor: "rgba(255,255,255,0.7)",
                              borderRadius: "50%",
                            }}
                          />
                        </Box>
                      </SwiperSlide>
                    ))}
                  </Swiper> */}
                  </Box>
                )}
                {/* Only show photo upload for non-videovideovideo types */}
                {!isVideoVideoVideoType && (
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
                )}
                <Button
                  variant="contained"
                  fullWidth
                  size={isMobile ? "medium" : "large"}
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    (isVideoVideoVideoType
                      ? !clientName || !whatsapp
                      : !whatsapp || !photo)
                  }
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
                  {isVideoVideoVideoType
                    ? "Your name will be personalized in the video that will be sent to your WhatsApp."
                    : "Your photo will be used to create a personalized video message that will be sent to your WhatsApp number."}
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
              {/* Only show photo preview for non-videovideovideo types */}
              {!isVideoVideoVideoType && (
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
              )}
              {/* Show output video preview */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: isVideoVideoVideoType ? "100%" : "auto",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#d32f2f", fontWeight: "bold" }}
                >
                  {isVideoVideoVideoType
                    ? "Your Personalized Video"
                    : "Selected Sample Output Video"}
                </Typography>

                {showOutputVideo && adminSetting ? (
                  <Fade in={true} timeout={1000}>
                    <Card
                      sx={{
                        maxWidth: isMobile ? 280 : 345,
                        width: "100%",
                        border: "2px solid #ffcdd2",
                        boxShadow: "0 4px 20px rgba(76, 175, 80, 0.3)",
                      }}
                    >
                      <CardMedia
                        component="video"
                        height={370}
                        src={
                          isVideoVideoVideoType
                            ? `https://api.bilimbebrandactivations.com/api/upload/file/${getOutput?.mergedVideoId}`
                            : gender === "Male1"
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
                      {isVideoVideoVideoType
                        ? "Submit your details to see your personalized video"
                        : "Submit your photo to see your generated video"}
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, textAlign: "center", px: isMobile ? 1 : 0 }}
                >
                  {showOutputVideo
                    ? isVideoVideoVideoType
                      ? "Your personalized video has been generated and sent to your WhatsApp!"
                      : "Your video has been generated and sent to your WhatsApp!"
                    : isMobile
                    ? "This is a sample preview of your video."
                    : "Preview how your final video will look once processing is complete."}
                </Typography>
                {/* Compact Social Media Share Section */}
              </Box>
            </Grid>
            {
              isVideoVideoVideoType && (<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    gap: 2,
    mb: 1,
    mt:5
  }}
>
  {/* WhatsApp */}
  <IconButton
    sx={{
      backgroundColor: "#25D366",
      color: "white",
      width: 48,
      height: 48,
      "&:hover": {
        backgroundColor: "#128C7E",
        transform: "scale(1.1)",
      },
      transition: "all 0.3s ease",
    }}
  >
    <WhatsAppIcon />
  </IconButton>

  {/* Facebook */}
  <IconButton
    sx={{
      backgroundColor: "#1877F2",
      color: "white",
      width: 48,
      height: 48,
      "&:hover": {
        backgroundColor: "#0D5CAF",
        transform: "scale(1.1)",
      },
      transition: "all 0.3s ease",
    }}
  >
    <FacebookIcon />
  </IconButton>

  {/* Instagram */}
  <IconButton
    sx={{
      background: "linear-gradient(45deg, #405DE6, #833AB4, #E1306C)",
      color: "white",
      width: 48,
      height: 48,
      "&:hover": {
        opacity: 0.9,
        transform: "scale(1.1)",
      },
      transition: "all 0.3s ease",
    }}
  >
    <InstagramIcon />
  </IconButton>

  {/* Twitter/X */}
  <IconButton
    sx={{
      backgroundColor: "#000000",
      color: "white",
      width: 48,
      height: 48,
      "&:hover": {
        backgroundColor: "#1A1A1A",
        transform: "scale(1.1)",
      },
      transition: "all 0.3s ease",
    }}
  >
    <TwitterIcon />
  </IconButton>

  {/* LinkedIn */}
  <IconButton
    sx={{
      backgroundColor: "#0077B5",
      color: "white",
      width: 48,
      height: 48,
      "&:hover": {
        backgroundColor: "#005582",
        transform: "scale(1.1)",
      },
      transition: "all 0.3s ease",
    }}
  >
    <LinkedInIcon />
  </IconButton>
</Box>)
            }
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
