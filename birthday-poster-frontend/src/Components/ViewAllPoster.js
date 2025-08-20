// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Container,
//   Typography,
//   Button,
//   Box,
//   Card,
//   CardMedia,
//   CardContent,
//   CircularProgress,
//   Paper,
//   Grid,
//   TextField,
//   IconButton,
//   Stack,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from "@mui/material";
// import {
//   Upload as UploadIcon,
//   Download,
//   Search as SearchIcon,
// } from "@mui/icons-material";
// import { Link } from "react-router-dom";
// import useAxios from "../useAxios";
// // export default function ViewAllPoster() {
// //     const axiosData = useAxios();
// //   const [mediaList, setMediaList] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchTerm, setSearchTerm] = useState("");

// //   useEffect(() => {
// //     const fetchMedia = async () => {
// //       try {
// //         const response = await axiosData.get(
// //           "upload/all"
// //         );
// //         setMediaList(response.data.reverse());
// //       } catch (error) {
// //         console.error("Error fetching media:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchMedia();
// //   }, []);

// //   const filteredMedia = mediaList.filter((media) =>
// //     media.name.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   return (
// //     <Container maxWidth="lg" sx={{ mt: 3,}}>
// //       <Paper
// //         elevation={3}
// //         sx={{
// //           p: 3,
// //           borderRadius: 4,
// //           background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
// //         }}
// //       >
// //         <Box
// //           sx={{
// //             display: "flex",
// //             justifyContent: "space-between",
// //             alignItems: "center",
// //             mb: 4,
// //           }}
// //         >
// //           <Typography
// //             variant="h4"
// //             gutterBottom
// //             sx={{
// //               fontWeight: 700,
// //               color: "#a91111ff",
// //               textTransform: "uppercase",
// //               letterSpacing: 1,
// //             }}
// //           >
// //             All Generated Posters
// //           </Typography>
// //           <Button
// //             variant="contained"
// //             color="error"
// //             component={Link}
// //             to="/"
// //             startIcon={<UploadIcon />}
// //           >
// //             Create New
// //           </Button>
// //         </Box>

// //         <TextField
// //           fullWidth
// //           variant="outlined"
// //           placeholder="Search by name..."
// //           value={searchTerm}
// //           onChange={(e) => setSearchTerm(e.target.value)}
// //           sx={{ mb: 3 }}
// //           color="error"
// //           InputProps={{
// //             endAdornment: (
// //               <IconButton>
// //                 <SearchIcon />
// //               </IconButton>
// //             ),
// //           }}
// //         />

// //         {loading ? (
// //           <Box
// //             sx={{
// //               display: "flex",
// //               justifyContent: "center",
// //               alignItems: "center",
// //               height: 300,
// //             }}
// //           >
// //             <CircularProgress size={60} />
// //           </Box>
// //         ) : filteredMedia.length === 0 ? (
// //           <Typography variant="h6" textAlign="center" sx={{ py: 4 }}>
// //             {searchTerm ? "No results found" : "No media available"}
// //           </Typography>
// //         ) : (
// //           <Grid container spacing={2}>
// //             {filteredMedia.map((media) => (
// //               <Grid item xs={12} sm={6} md={4} key={media._id}>
// //                 <Card
// //                   sx={{
// //                     height: "100%",
// //                     display: "flex",
// //                     flexDirection: "column",
// //                   }}
// //                 >
// //                   <CardMedia
// //                     component="img"
// //                     image={`https://api.bilimbebrandactivations.com/api/upload/file/${media.photoId}`}
// //                     alt={media.name}
// //                     sx={{
// //                       height: 150,
// //                       width: 264,
// //                       maxWidth: "100%",
// //                       objectFit: "contain",
// //                       margin: "0 auto",
// //                       display: "block",
// //                       backgroundColor:"#a91111ff"
// //                     }}
// //                   />
// //                   <CardContent sx={{ flexGrow: 1,padding:1,textAlign:"center" }}>
// //                     <Typography gutterBottom variant="h7" component="div" fontWeight={600}>
// //                       {media.name}
// //                     </Typography>
// //                     <Typography variant="body2" color="text.secondary">
// //                       Date: {new Date(media.date).toLocaleDateString()}
// //                     </Typography>
// //                   </CardContent>
// //                   <CardContent>
// //                     <Stack direction="row" spacing={2} sx={{padding:0 }}>
// //                       <Button
// //                         variant="outlined"
// //                         color="error"
// //                         startIcon={<Download />}
// //                         href={`https://api.bilimbebrandactivations.com/api/upload/file/${media.posterId}`}
// //                         download="poster.png"
// //                         fullWidth
// //                         size="small"
// //                       >
// //                         Poster
// //                       </Button>
// //                       <Button
// //                         variant="outlined"
// //                         color="error"
// //                         startIcon={<Download />}
// //                         href={`https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}`}
// //                         download="final-video.mp4"
// //                         fullWidth
// //                         size="small"
// //                       >
// //                         Video
// //                       </Button>
// //                     </Stack>
// //                   </CardContent>
// //                 </Card>
// //               </Grid>
// //             ))}
// //           </Grid>
// //         )}
// //       </Paper>
// //     </Container>
// //   );
// // }
// export default function ViewAllPoster() {
//   const axiosData = useAxios();
//   const [mediaList, setMediaList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all"); // New state for type filter

//   useEffect(() => {
//     const fetchMedia = async () => {
//       try {
//         const response = await axiosData.get("upload/all");
//         setMediaList(response.data.reverse());
//       } catch (error) {
//         console.error("Error fetching media:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMedia();
//   }, []);

//   const filteredMedia = mediaList.filter((media) => {
//     const matchesSearch = media.name.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesType = typeFilter === "all" || media.type === typeFilter;
//     return matchesSearch && matchesType;
//   });

//   return (
//     <Container maxWidth="lg" sx={{ mt: 3 }}>
//       <Paper
//         elevation={3}
//         sx={{
//           p: 3,
//           borderRadius: 4,
//           background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             mb: 4,
//           }}
//         >
//           <Typography
//             variant="h4"
//             gutterBottom
//             sx={{
//               fontWeight: 700,
//               color: "#a91111ff",
//               textTransform: "uppercase",
//               letterSpacing: 1,
//             }}
//           >
//             All Generated Posters
//           </Typography>
//           <Button
//             variant="contained"
//             color="error"
//             component={Link}
//             to="/"
//             startIcon={<UploadIcon />}
//           >
//             Create New
//           </Button>
//         </Box>

//         <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
//           <TextField
//             fullWidth
//             variant="outlined"
//             placeholder="Search by name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             color="error"
//             InputProps={{
//               endAdornment: (
//                 <IconButton>
//                   <SearchIcon />
//                 </IconButton>
//               ),
//             }}
//           />

//           <FormControl sx={{ minWidth: 300 }}>
//             <InputLabel color="error">Filter by Type</InputLabel>
//             <Select
//               value={typeFilter}
//               label="Filter by Type"
//               onChange={(e) => setTypeFilter(e.target.value)}
//               color="error"
//             >
//               <MenuItem value="all">All Types</MenuItem>
//               <MenuItem value="videovideo">Video + Video</MenuItem>
//               <MenuItem value="photogif">Photo + GIF</MenuItem>
//               <MenuItem value="videophoto">Video + Photo</MenuItem>
//             </Select>
//           </FormControl>
//         </Box>

//         {loading ? (
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: 300,
//             }}
//           >
//             <CircularProgress size={60} />
//           </Box>
//         ) : filteredMedia.length === 0 ? (
//           <Typography variant="h6" textAlign="center" sx={{ py: 4 }}>
//             {searchTerm || typeFilter !== "all"
//               ? "No matching results found"
//               : "No media available"}
//           </Typography>
//         ) : (
//           <Grid container spacing={2}>
//             {filteredMedia.map((media) => (
//               <Grid item xs={12} sm={6} md={4} key={media._id}>
//                 <Card
//                   sx={{
//                     height: "100%",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   <CardMedia
//                     component="img"
//                     image={`https://api.bilimbebrandactivations.com/api/upload/file/${media.photoId}`}
//                     alt={media.name}
//                     sx={{
//                       height: 150,
//                       width: 264,
//                       maxWidth: "100%",
//                       objectFit: "contain",
//                       margin: "0 auto",
//                       display: "block",
//                       backgroundColor:"#a91111ff"
//                     }}
//                   />
//                   <CardContent sx={{ flexGrow: 1, padding: 1, textAlign: "center" }}>
//                     <Typography gutterBottom variant="h7" component="div" fontWeight={600}>
//                       {media.name}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       Date: {new Date(media.date).toLocaleDateString()}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                       Type: {media.type.replace("video", "Video").replace("photo", "Photo").replace("gif", "GIF")}
//                     </Typography>
//                   </CardContent>
//                   <CardContent>
//                     <Stack direction="row" spacing={2} sx={{ padding: 0 }}>
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         startIcon={<Download />}
//                         href={`https://api.bilimbebrandactivations.com/api/upload/file/${media.posterId}`}
//                         download="poster.png"
//                         fullWidth
//                         size="small"
//                       >
//                         Poster
//                       </Button>
//                       <Button
//                         variant="outlined"
//                         color="error"
//                         startIcon={<Download />}
//                         href={`https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}`}
//                         download="final-video.mp4"
//                         fullWidth
//                         size="small"
//                       >
//                         Video
//                       </Button>
//                     </Stack>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Paper>
//     </Container>
//   );
// }
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Grid,
  TextField,
  IconButton,
  Stack,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  Grow,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ThemeProvider,
  createTheme,
  Alert,
} from "@mui/material";
import {
  Upload as UploadIcon,
  Download,
  Search as SearchIcon,
  Videocam,
  Image,
  Movie,
  MoreVert,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import useAxios from "../useAxios";
import { motion } from "framer-motion";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VideoPlayerWithQR from "./VideoPlayerWithQR ";
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

export default function ViewAllPoster() {
  const axiosData = useAxios();
  const [mediaList, setMediaList] = useState([]);
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  useEffect(() => {
    fetchMedia();
  }, []);
  const fetchMedia = async () => {
    try {
      const response = await axiosData.get("upload/all");
      setMediaList(response.data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };
  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPhoneNumber("");
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
      const shareData = new FormData();
      // Append the mediaType to the form data
      shareData.append("_id", media._id);
      shareData.append("mobile", formattedNumber);
      shareData.append("link", downloadUrl);
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
        fetchMedia();
        setSuccess(true);
      }
    } catch (err) {
      setLoading(false);
      console.error("Share error:", err);
      closeModal();
    }
    //window.open(whatsappUrl, "_blank");
  };
  const filteredMedia = mediaList.filter((media) => {
    const matchesSearch = media.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || media.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeDetails = (type) => {
    const types = {
      videovideo: {
        display: "Video Combo",
        icon: <Videocam />,
        color: "#ff3d3d", // Vibrant red
        bgColor: "rgba(255, 61, 61, 0.1)",
        description: "Dual video composition",
      },
      photogif: {
        display: "Photo + GIF",
        icon: <Image />,
        color: "#4caf50", // Green
        bgColor: "rgba(76, 175, 80, 0.1)",
        description: "Static image with animation",
      },
      videophoto: {
        display: "Video + Photo",
        icon: <Movie />,
        color: "#2196f3", // Blue
        bgColor: "rgba(33, 150, 243, 0.1)",
        description: "Video with end time poster image",
      },
    };
    return (
      types[type] || {
        display: type,
        icon: <Image />,
        color: "#9e9e9e",
        bgColor: "rgba(158, 158, 158, 0.1)",
        description: "Media composition",
      }
    );
  };

  return (
    <Box
      sx={{
         p: 0.5,
        height: "100%",
        borderRadius: 3,
        backgroundColor: "rgba(255, 61, 61, 0.05)",
      }}
    >
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* Header Section */}
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            p: 1,
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background:
                  "linear-gradient(45deg, #ff3d3d 0%, #a91111ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
                letterSpacing: -0.5,
              }}
            >
              All Generated Videos
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Browse and manage all your created videos
            </Typography>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/"
              startIcon={<UploadIcon />}
              sx={{
                background:
                  "linear-gradient(45deg, #e63030ff 0%, #a91111ff 100%)",
                borderRadius: 2,
                px: 4,
                py: 1.5,
                boxShadow: "0 4px 15px rgba(255, 61, 61, 0.3)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(255, 61, 61, 0.4)",
                },
              }}
            >
              Create New
            </Button>
          </motion.div>
        </Box> */}

        {/* Search and Filter Section */}
        {/* <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              },
            }}
            InputProps={{
              startAdornment: (
                <IconButton sx={{ color: "#d61a1aff" }}>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 300 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={typeFilter}
              label="Filter by Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="videovideo">Video + Video</MenuItem>
              <MenuItem value="photogif">Photo + GIF</MenuItem>
              <MenuItem value="videophoto">Video + Photo</MenuItem>
            </Select>
          </FormControl>
        </Box> */}

        {/* Content Section */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <CircularProgress
                size={80}
                thickness={4}
                sx={{ color: "#d61a1aff" }}
              />
            </motion.div>
          </Box>
        ) : filteredMedia.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              p: 8,
              borderRadius: 3,
              backgroundColor: "rgba(255, 61, 61, 0.05)",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              {searchTerm || typeFilter !== "all"
                ? "No matching results found"
                : "Your gallery is empty"}
            </Typography>
            <Typography color="text.secondary">
              {searchTerm || typeFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first poster to get started"}
            </Typography>
          </Box>
        ) : (<Box>
         <VideoPlayerWithQR videos={filteredMedia}/>
          <Grid
            container
            spacing={2}
            sx={{ display: "flex",marginTop:5, justifyContent: "space-evenly" }}
          >
           
            {filteredMedia.map((media, index) => (
              <Grid item xs={12} sm={6} md={4} key={media._id}>
                <Grow in timeout={(index + 1) * 200}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "row",
                      borderRadius: 3,
                      //overflow: 'hidden',
                      //width: 270,
                      transition: "all 0.3s ease",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                      },
                    }}
                  >
                    {/* Card Header with Type Tag */}
                    <Box
                      sx={{
                        position: "relative",
                        height: 370,
                        overflow: "hidden",
                      }}
                    >
                      {/* <CardMedia
                      component="img"
                      image={`https://api.bilimbebrandactivations.com/api/upload/file/${media.photoId}`}
                      alt={media.name}
                      sx={{
                        height: 150, 
                      // width: 274, 
                      maxWidth: "100%", 
                      backgroundColor:"#a91111ff",
                        objectFit: 'contain',
                        margin: "0 auto", 
                       display: "block", 
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    /> */}
                      {media?.type === "videovideo" ? (
                        // Video poster with play icon overlay
                        <>
                          {/* <CardMedia
                            component="img"
                            image={`https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}`}
                            alt={media.name}
                            sx={{
                              height: 150,
                              // width: 274,
                              maxWidth: "100%",
                              backgroundColor: "#a91111ff",
                              objectFit: "contain",
                              margin: "0 auto",
                              display: "block",
                              transition: "transform 0.5s ease",
                              "&:hover": {
                                transform: "scale(1.1)",
                              },
                            }}
                          /> */}
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
                                media?.type === "videophoto"
                                  ? `https://api.bilimbebrandactivations.com/api/upload/file/${media?.mergedVideoId}`
                                  : `https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}`
                              }
                              type="video/mp4"
                            />
                            Your browser does not support the video tag.
                          </video>
                          {/* <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",

                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <Videocam
                              sx={{
                                fontSize: 48,
                                color: "rgba(255,255,255,0.9)",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "scale(1.2)",
                                  color: "#fff",
                                },
                              }}
                            />
                          </Box> */}
                        </>
                      ) : (
                        // Regular image for other types
                        <CardMedia
                          component="img"
                          image={`https://api.bilimbebrandactivations.com/api/upload/file/${media.photoId}`}
                          alt={media.name}
                          sx={{
                            height: 370,
                            // width: 274,
                            //maxWidth: "100%",
                            backgroundColor: "#a91111ff",
                            objectFit: "contain",
                            margin: "0 auto",
                            display: "block",
                            transition: "transform 0.5s ease",
                            "&:hover": {
                              transform: "scale(1.1)",
                            },
                          }}
                        />
                      )}
                      <Chip
                        label={getTypeDetails(media.type).display}
                        size="small"
                        icon={getTypeDetails(media.type).icon}
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          backgroundColor: getTypeDetails(media.type).bgColor,
                          color: "#fff",
                          backdropFilter: "blur(4px)",
                          fontWeight: 600,
                          border: `1px solid ${
                            getTypeDetails(media.type).color
                          }`,
                        }}
                        color="#fff"
                      />
                    </Box>

                    {/* Card Content */}
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        p: 1,
                        background: "white",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {media.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="black"
                        sx={{ mb: 1 }}
                      >
                        {new Date(media.date).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {getTypeDetails(media.type).description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-evenly",
                          alignItems: "center",
                          m: "auto",
                        }}
                      >
                        <Stack direction="row" spacing={1}>
                          {media?.posterId && (
                            <div
                              style={{
                                margin: "10px",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Download />}
                                href={`https://api.bilimbebrandactivations.com/api/upload/file/${media.posterId}`}
                                sx={{
                                  borderRadius: 2,
                                  borderColor: getTypeDetails(media.type).color,
                                  color: getTypeDetails(media.type).color,
                                  "&:hover": {
                                    backgroundColor: getTypeDetails(media.type)
                                      .bgColor,
                                  },
                                }}
                              >
                                Poster
                              </Button>
                            </div>
                          )}
                          <div
                            style={{
                              margin: "10px",
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            {" "}
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Download />}
                              href={
                                media?.type === "videophoto"
                                  ? `https://api.bilimbebrandactivations.com/api/upload/file/${media.mergedVideoId}`
                                  : `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}`
                              }
                              sx={{
                                borderRadius: 2,
                                background: `linear-gradient(45deg, ${
                                  getTypeDetails(media.type).color
                                } 0%, ${
                                  getTypeDetails(media.type).color
                                }80 100%)`,
                                boxShadow: `0 2px 8px ${
                                  getTypeDetails(media.type).color
                                }40`,
                                "&:hover": {
                                  boxShadow: `0 4px 12px ${
                                    getTypeDetails(media.type).color
                                  }60`,
                                },
                              }}
                            >
                              Video
                            </Button>
                          </div>
                          {(media.whatsappstatus === "pending" ||
                            media.whatsappstatus === "no") && (
                            <div
                              style={{
                                margin: "5px",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <IconButton
                                onClick={() => {
                                  setMedia(media);
                                  openModal();
                                }}
                                style={{
                                  color: "white",
                                  backgroundColor: "green",
                                }}
                              >
                                <WhatsAppIcon />
                              </IconButton>
                            </div>
                          )}
                        </Stack>                         
                      </Box>
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
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
          </Box>
        )}
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
