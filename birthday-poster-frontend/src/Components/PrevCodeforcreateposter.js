// import React, { useState, useRef } from 'react';
// import axios from 'axios';
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Stack,
//   Card,
//   CardMedia,
//   CardContent,
//   CircularProgress,
//   Paper,
//   Grid,
//   Divider,
//   IconButton,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Chip
// } from '@mui/material';
// import useAxios from "../useAxios";
// import { Upload as UploadIcon, Download, PlayArrow, Pause, List, Close } from '@mui/icons-material';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// function CreatePosterPage() {
//   const axiosData = useAxios();
//   const [mediaType, setMediaType] = useState('photogif');
//   const [formData, setFormData] = useState({
//     name: '',
//     date: '',
//     type:'',
//     photo: null,
//     gif: null,
//     video: null
//   });
//   const [fileNames, setFileNames] = useState({
//     photo: '',
//     gif: '',
//     video: ''
//   });
//   const [media, setMedia] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const videoRef = useRef();

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (files && files[0]) {
//       setFormData((prev) => ({ ...prev, [name]: files[0] }));
//       setFileNames((prev) => ({ ...prev, [name]: files[0].name }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleRemoveFile = (fileType) => {
//     setFormData((prev) => ({ ...prev, [fileType]: null }));
//     setFileNames((prev) => ({ ...prev, [fileType]: '' }));
//   };

//   const handleMediaTypeChange = (e) => {
//     setMediaType(e.target.value);
//     setFormData({ name: '', date: '', type:"e.target.value", photo: null, gif: null, video: null });
//     setFileNames({ photo: '', gif: '', video: '' });
//     setMedia(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMedia(null);
//     setUploading(true);
//     try {
//       const uploadData = new FormData();
//       Object.entries(formData).forEach(([key, val]) => {
//         if (val) uploadData.append(key, val);
//       });
//        // Append the mediaType to the form data
//       uploadData.append('type', mediaType);
//       const endpoint = `upload/${mediaType}`;
//       const res = await axiosData.post(endpoint, uploadData, {
//         headers: {
//           "Content-Type": "multipart/form-data"
//         }
//       });

//       setMedia(res.data.media);
//     } catch (err) {
//       console.error('Upload error:', err);
//       alert('Upload failed. Check server and FFmpeg setup.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const renderFileUploads = () => {
//     switch (mediaType) {
//       case 'videovideo':
//         return (
//           <>
//             <Box>
//               <Button
//                 variant="contained"
//                 component="label"
//                 color="error"
//                 startIcon={<UploadIcon />}
//                 sx={{ py: 1.5 }}
//                 fullWidth
//               >
//                 Upload First Video
//                 <input type="file" name="video" hidden onChange={handleChange} accept="video/*" />
//               </Button>
//               {fileNames.video && (
//                 <Chip
//                   label={fileNames.video}
//                   onDelete={() => handleRemoveFile('video')}
//                   deleteIcon={<Close />}
//                   sx={{ mt: 1 }}
//                   variant="outlined"
//                 />
//               )}
//             </Box>
//             <Box>
//               <Button
//                 variant="contained"
//                 component="label"
//                 color="error"
//                 startIcon={<UploadIcon />}
//                 sx={{ py: 1.5 }}
//                 fullWidth
//               >
//                 Upload Second Video
//                 <input type="file" name="gif" hidden onChange={handleChange} accept="video/*" />
//               </Button>
//               {fileNames.gif && (
//                 <Chip
//                   label={fileNames.gif}
//                   onDelete={() => handleRemoveFile('gif')}
//                   deleteIcon={<Close />}
//                   sx={{ mt: 1 }}
//                   variant="outlined"
//                 />
//               )}
//             </Box>
//           </>
//         );
//       case 'photogif':
//         return (
//           <>
//             <Box>
//               <Button
//                 variant="contained"
//                 component="label"
//                 color="error"
//                 startIcon={<UploadIcon />}
//                 sx={{ py: 1.5 }}
//                 fullWidth
//               >
//                 Upload Photo
//                 <input type="file" name="photo" hidden onChange={handleChange} accept="image/*" />
//               </Button>
//               {fileNames.photo && (
//                 <Chip
//                   label={fileNames.photo}
//                   onDelete={() => handleRemoveFile('photo')}
//                   deleteIcon={<Close />}
//                   sx={{ mt: 1 }}
//                   variant="outlined"
//                 />
//               )}
//             </Box>
//             <Box>
//               <Button
//                 variant="contained"
//                 component="label"
//                 color="error"
//                 startIcon={<UploadIcon />}
//                 sx={{ py: 1.5 }}
//                 fullWidth
//               >
//                 Upload GIF
//                 <input type="file" name="gif" hidden onChange={handleChange} accept="gif/*" />
//               </Button>
//               {fileNames.gif && (
//                 <Chip
//                   label={fileNames.gif}
//                   onDelete={() => handleRemoveFile('gif')}
//                   deleteIcon={<Close />}
//                   sx={{ mt: 1 }}
//                   variant="outlined"
//                 />
//               )}
//             </Box>
//           </>
//         );
//       case 'videophoto':
//         return (
//           <>
//             <Box>
//               <Button
//                 variant="contained"
//                 component="label"
//                 color="error"
//                 startIcon={<UploadIcon />}
//                 sx={{ py: 1.5 }}
//                 fullWidth
//               >
//                 Upload Video
//                 <input type="file" name="video" hidden onChange={handleChange} accept="video/*" />
//               </Button>
//               {fileNames.video && (
//                 <Chip
//                   label={fileNames.video}
//                   onDelete={() => handleRemoveFile('video')}
//                   deleteIcon={<Close />}
//                   sx={{ mt: 1 }}
//                   variant="outlined"
//                 />
//               )}
//             </Box>
//             <Box>
//               <Button
//                 variant="contained"
//                 component="label"
//                 color="error"
//                 startIcon={<UploadIcon />}
//                 sx={{ py: 1.5 }}
//                 fullWidth
//               >
//                 Upload Photo
//                 <input type="file" name="photo" hidden onChange={handleChange} accept="image/*" />
//               </Button>
//               {fileNames.photo && (
//                 <Chip
//                   label={fileNames.photo}
//                   onDelete={() => handleRemoveFile('photo')}
//                   deleteIcon={<Close />}
//                   sx={{ mt: 1 }}
//                   variant="outlined"
//                 />
//               )}
//             </Box>
//           </>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
//       <Paper elevation={3} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//           <Typography variant="h4"
//             sx={{
//               fontWeight: 700,
//               color: '#a91111ff',
//               textTransform: 'uppercase',
//               textAlign:"center",
//               letterSpacing: 1
//             }}>
//             Video Poster Generator
//           </Typography>
//           <Button
//             variant="contained"
//             color="error"
//             component={Link}
//             to="/view-all-posters"
//             startIcon={<List />}
//           >
//             View All
//           </Button>
//         </Box>

//         <Grid container spacing={3} sx={{ display:"flex",flexDirection:"row",justifyContent:"space-between"}}>
//           <Grid item xs={12} md={6} sx={{width:500}}>
//             <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
//               <Typography variant="h6"sx={{ mb: 2, fontWeight: 600 ,textAlign:"center",color:"#a91111ff"}}>Create Your Poster Video</Typography>
//               <Divider sx={{ mb: 3 }} />

//               <FormControl fullWidth sx={{ mb: 3 }}>
//                 <InputLabel id="media-type-label" color="error">Media Type</InputLabel>
//                 <Select
//                   labelId="media-type-label"
//                   value={mediaType}
//                   label="Media Type"
//                   onChange={handleMediaTypeChange}
//                   color="error"
//                 >
//                   <MenuItem value="videovideo">Video + Video</MenuItem>
//                   <MenuItem value="photogif">Photo + GIF</MenuItem>
//                   <MenuItem value="videophoto">Video + Photo</MenuItem>
//                 </Select>
//               </FormControl>

//               <Box component="form" onSubmit={handleSubmit}>
//                 <Stack spacing={3}>
//                   <TextField
//                     name="name"
//                     label="Name"
//                     fullWidth
//                     required
//                     onChange={handleChange}
//                     variant="outlined"
//                     size="small"
//                     color="error"
//                     value={formData.name}
//                   />

//                   <TextField
//                     name="date"
//                     label="Date"
//                     type="date"
//                     fullWidth
//                     required
//                     onChange={handleChange}
//                     variant="outlined"
//                     color="error"
//                     size="small"
//                     InputLabelProps={{ shrink: true }}
//                     value={formData.date}
//                   />

//                   {renderFileUploads()}

//                   <Button
//                     variant="contained"
//                     color="error"
//                     type="submit"
//                     disabled={uploading || !formData.name || !formData.date ||
//                       (mediaType === 'videovideo' && (!formData.video || !formData.gif)) ||
//                       (mediaType === 'photogif' && (!formData.photo || !formData.gif)) ||
//                       (mediaType === 'videophoto' && (!formData.video || !formData.photo))}
//                     sx={{ py: 1.5, fontWeight: 600 }}
//                     fullWidth
//                   >
//                     {uploading ? (
//                       <>
//                         <CircularProgress size={24} sx={{ mr: 2 }} />
//                         Processing...
//                       </>
//                     ) : `Generate ${mediaType.replace('video', 'Video').replace('gif', 'GIF').replace('photo', 'Photo')}`}
//                   </Button>
//                 </Stack>
//               </Box>
//             </Paper>
//           </Grid>

//           <Grid item xs={12} md={6} sx={{width:500}}>
//             <Paper elevation={2} sx={{ p: 2, borderRadius: 3, minHeight: 425 }}>
//               <Typography variant="h6" sx={{ mb: 2, fontWeight: 600,textAlign:"center" ,color:"#a91111ff"}}>Generated Output</Typography>
//               <Divider sx={{ mb: 3 }} />

//               {uploading && (
//                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
//                   <CircularProgress size={60} />
//                 </Box>
//               )}

//               {!media && !uploading && (
//                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
//                   <Typography>No Media Created</Typography>
//                 </Box>
//               )}

//               {media?.photoId && (
//                 <Box>
//                   <Card sx={{ borderRadius: 2, mb: 2 }}>
//                     {mediaType === 'videogif' && media?.posterVideoId && (
//                       <video
//                         src={`http://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}`}
//                         width="100%"
//                         controls
//                         style={{ borderRadius: '8px 8px 0 0' }}
//                       />
//                     )}
//                     <CardMedia
//                       component="img"
//                       image={`http://api.bilimbebrandactivations.com/api/upload/file/${media?.photoId}`}
//                       alt="Poster"
//                       sx={{ maxHeight: 240, objectFit: 'contain' }}
//                     />
//                     <CardContent sx={{ pt: 1 }}>
//                       <Stack direction="row" spacing={2}>
//                         {media?.posterId && (
//                           <Button
//                             variant="outlined"
//                             color='error'
//                             startIcon={<Download />}
//                             href={`http://api.bilimbebrandactivations.com/api/upload/file/${media?.posterId}?download=true`}
//                             download="poster.png"
//                             fullWidth
//                           >
//                             Poster
//                           </Button>
//                         )}
//                         {media?.posterVideoId && (
//                           <Button
//                             variant="outlined"
//                             color='error'
//                             startIcon={<Download />}
//                             href={`http://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}?download=true`}
//                             download="final-video.mp4"
//                             fullWidth
//                           >
//                             Video
//                           </Button>
//                         )}
//                       </Stack>
//                     </CardContent>
//                   </Card>
//                 </Box>
//               )}
//             </Paper>
//           </Grid>
//         </Grid>
//       </Paper>
//     </Container>
//   );
// }

// export default CreatePosterPage;
// import React, { useState, useRef } from "react";
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Box,
//   Grid,
//   Card,
//   CardMedia,
//   CardContent,
//   CircularProgress,
//   Divider,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   Chip,
//   Avatar,
//   IconButton,
//   Fade,
// } from "@mui/material";
// import {
//   Movie,
//   Image,
//   Gif,
//   PhotoCamera,
//   Videocam,
//   CalendarToday,
//   PersonOutline,
//   Category,
//   CloudUpload,
//   Download,
//   PlayArrow,
//   Pause,
//   Close,
//   AutoAwesome,
//   Palette,
//   LinearScale,
// } from "@mui/icons-material";
// import { styled } from "@mui/material/styles";

// const GradientButton = styled(Button)(({ theme }) => ({
//   background: "linear-gradient(45deg, #FF416C 0%, #FF4B2B 100%)",
//   color: "white",
//   fontWeight: 700,
//   padding: "12px 24px",
//   borderRadius: "12px",
//   boxShadow: "0 4px 15px rgba(255, 75, 43, 0.4)",
//   transition: "all 0.3s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//     boxShadow: "0 6px 20px rgba(255, 75, 43, 0.6)",
//     background: "linear-gradient(45deg, #FF416C 10%, #FF4B2B 100%)",
//   },
//   "&:disabled": {
//     background: "linear-gradient(45deg, #616161 0%, #9E9E9E 100%)",
//     boxShadow: "none",
//   },
// }));

// const StyledCard = styled(Card)(({ theme }) => ({
//   borderRadius: "16px",
//   overflow: "hidden",
//   transition: "transform 0.3s ease, box-shadow 0.3s ease",
//   "&:hover": {
//     transform: "translateY(-5px)",
//     boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
//   },
// }));

// const FileUploadBox = styled(Box)(({ theme }) => ({
//   border: "2px dashed rgba(255, 255, 255, 0.2)",
//   borderRadius: "12px",
//   padding: theme.spacing(2),
//   textAlign: "center",
//   cursor: "pointer",
//   transition: "all 0.3s ease",
//   backgroundColor: "rgba(255, 255, 255, 0.05)",
//   "&:hover": {
//     borderColor: "#FF416C",
//     backgroundColor: "rgba(255, 65, 108, 0.1)",
//   },
// }));

// function CreatePosterPage() {
//   const [mediaType, setMediaType] = useState("photogif");
//   const [formData, setFormData] = useState({
//     name: "",
//     date: "",
//     type: "",
//     photo: null,
//     gif: null,
//     video: null,
//   });
//   const [fileNames, setFileNames] = useState({
//     photo: "",
//     gif: "",
//     video: "",
//   });
//   const [media, setMedia] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const videoRef = useRef();

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (files && files[0]) {
//       setFormData((prev) => ({ ...prev, [name]: files[0] }));
//       setFileNames((prev) => ({ ...prev, [name]: files[0].name }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleRemoveFile = (fileType) => {
//     setFormData((prev) => ({ ...prev, [fileType]: null }));
//     setFileNames((prev) => ({ ...prev, [fileType]: "" }));
//   };

//   const handleMediaTypeChange = (e) => {
//     setMediaType(e.target.value);
//     setFormData({
//       name: "",
//       date: "",
//       type: e.target.value,
//       photo: null,
//       gif: null,
//       video: null,
//     });
//     setFileNames({ photo: "", gif: "", video: "" });
//     setMedia(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMedia(null);
//     setUploading(true);
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//       setMedia({
//         photoId: "123",
//         url: "https://source.unsplash.com/random/800x600?poster",
//       });
//     } catch (err) {
//       console.error("Upload error:", err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const renderFileUploads = () => {
//     const uploadOptions = {
//       videovideo: [
//         {
//           name: "video",
//           label: "Upload First Video",
//           icon: <Videocam />,
//           accept: "video/*",
//         },
//         {
//           name: "gif",
//           label: "Upload Second Video",
//           icon: <Videocam />,
//           accept: "video/*",
//         },
//       ],
//       photogif: [
//         {
//           name: "photo",
//           label: "Upload Photo",
//           icon: <PhotoCamera />,
//           accept: "image/*",
//         },
//         {
//           name: "gif",
//           label: "Upload GIF",
//           icon: <Gif />,
//           accept: "image/gif",
//         },
//       ],
//       videophoto: [
//         {
//           name: "video",
//           label: "Upload Video",
//           icon: <Videocam />,
//           accept: "video/*",
//         },
//         {
//           name: "photo",
//           label: "Upload Photo",
//           icon: <PhotoCamera />,
//           accept: "image/*",
//         },
//       ],
//     };

//     return uploadOptions[mediaType].map((input) => (
//       <Grid item xs={12} md={6} key={input.name}>
//         <FileUploadBox sx={{width:200}}>
//           <input
//             type="file"
//             name={input.name}
//             id={input.name}
//             hidden
//             onChange={handleChange}
//             accept={input.accept}
//           />
//           <label
//             htmlFor={input.name}
//             style={{ width: "50%", cursor: "pointer" }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//               }}
//             >
//               <Avatar
//                 sx={{
//                   bgcolor: "rgba(255, 65, 108, 0.2)",
//                   color: "#FF416C",
//                   width: 26,
//                   height: 26,
//                   mb: 0.5,
//                 }}
//               >
//                 {input.icon}
//               </Avatar>
//               <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
//                 {input.label}
//               </Typography>
//               <Typography variant="caption" color="text.secondary">
//                 {input.accept.includes("video")
//                   ? "MP4, MOV, AVI"
//                   : input.accept.includes("gif")
//                   ? "GIF format"
//                   : "JPG, PNG"}
//               </Typography>
//             </Box>
//           </label>
//           {fileNames[input.name] && (
//             <Fade in={true}>
//               <Chip
//                 label={fileNames[input.name]}
//                 onDelete={() => handleRemoveFile(input.name)}
//                 deleteIcon={<Close />}
//                 sx={{
//                   mt: 2,
//                   backgroundColor: "rgba(255, 65, 108, 0.2)",
//                   color: "white",
//                   border: "1px solid rgba(255, 65, 108, 0.5)",
//                   borderRadius: "8px",
//                   height: "auto",
//                   py: 1,
//                 }}
//                 avatar={
//                   <Avatar
//                     sx={{ bgcolor: "rgba(255, 65, 108, 0.3)", color: "white" }}
//                   >
//                     {input.icon}
//                   </Avatar>
//                 }
//               />
//             </Fade>
//           )}
//         </FileUploadBox>
//       </Grid>
//     ));
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #2e1a1aff 0%, #16213E 100%)",
//       }}
//     >
//       <Container maxWidth="lg" sx={{ py: 1.5 }}>
//         {/* Header Section */}
//         <Box
//           sx={{
//             textAlign: "center",
//             mb: 1,
//             position: "relative",
//           }}
//         >
//           <Box
//             sx={{
//               display: "inline-flex",
//               alignItems: "center",
//               mb: 1,
//               px: 4,
//               py: 1,
//               borderRadius: "16px",
//               background: "rgba(255, 255, 255, 0.05)",
//               backdropFilter: "blur(10px)",
//               border: "1px solid rgba(255, 255, 255, 0.1)",
//               position: "relative",
//               overflow: "hidden",
//               "&::before": {
//                 content: '""',
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 height: "2px",
//                 background: "linear-gradient(90deg, #FF416C 0%, #FF4B2B 100%)",
//               },
//             }}
//           >
//             <AutoAwesome
//               sx={{
//                 fontSize: 36,
//                 mr: 2,
//                 color: "#FF416C",
//                 filter: "drop-shadow(0 0 8px rgba(255, 65, 108, 0.7))",
//               }}
//             />
//             <Typography
//               variant="h4"
//               sx={{
//                 fontWeight: 800,
//                 color: "white",
//                 letterSpacing: "-0.5px",
//                 background: "linear-gradient(90deg, #FF416C 0%, #FF4B2B 100%)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//               }}
//             >
//               Video Poster Generator
//             </Typography>
//           </Box>
//           <Typography
//             variant="subtitle1"
//             sx={{
//               maxWidth: 600,
//               mx: "auto",
//               color: "rgba(255, 255, 255, 0.7)",
//             }}
//           >
//             Transform your media into stunning video poster
//           </Typography>
//         </Box>

//         <Grid
//           container
//           spacing={3}
//           sx={{ display: "flex", justifyContent: "space-between" }}
//         >
//           {/* Left Column - Form */}
//           <Grid item xs={12} md={6}>
//             <Box
//               sx={{
//                 p: 2,
//                 borderRadius: "16px",
//                 //height: "100%",
//                 width: 500,
//                 background: "rgba(255, 255, 255, 0.05)",
//                 backdropFilter: "blur(10px)",
//                 border: "1px solid rgba(255, 255, 255, 0.1)",
//                 boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
//               }}
//             >
//               <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
//                 <Palette
//                   sx={{
//                     fontSize: 32,
//                     mr: 2,
//                     color: "#FF416C",
//                   }}
//                 />
//                 <Typography
//                   variant="h5"
//                   sx={{
//                     fontWeight: 700,
//                     color: "white",
//                   }}
//                 >
//                   Create New Poster
//                 </Typography>
//               </Box>
//               <Divider
//                 sx={{
//                   mb: 1.5,
//                   borderColor: "rgba(255, 255, 255, 0.1)",
//                 }}
//               />

//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel
//                   id="media-type-label"
//                   sx={{
//                     color: "rgba(255, 255, 255, 0.7)",
//                     "&.Mui-focused": {
//                       color: "#FF416C",
//                     },
//                   }}
//                 >
//                   <Box sx={{ display: "flex", alignItems: "center" }}>
//                     <Category
//                       sx={{
//                         mr: 1.5,
//                         fontSize: 24,
//                         color: "#FF416C",
//                       }}
//                     />
//                     Type
//                   </Box>
//                 </InputLabel>
//                 <Select
//                   labelId="media-type-label"
//                   value={mediaType}
//                   label="Media Type"
//                   onChange={handleMediaTypeChange}
//                   sx={{
//                     color: "white",
//                     "& .MuiSelect-select": {
//                       display: "flex",
//                       alignItems: "center",
//                       py: 1.5,
//                     },
//                     "& .MuiOutlinedInput-notchedOutline": {
//                       borderColor: "rgba(255, 255, 255, 0.2)",
//                     },
//                     "&:hover .MuiOutlinedInput-notchedOutline": {
//                       borderColor: "#FF416C",
//                     },
//                     "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                       borderColor: "#FF416C",
//                     },
//                     "& .MuiSvgIcon-root": {
//                       color: "white",
//                     },
//                   }}
//                 >
//                   <MenuItem value="videovideo">
//                     <Box sx={{ display: "flex", alignItems: "center" }}>
//                       <Videocam sx={{ mr: 1.5, color: "#FF416C" }} />
//                       <Typography>Video + Video</Typography>
//                     </Box>
//                   </MenuItem>
//                   <MenuItem value="photogif">
//                     <Box sx={{ display: "flex", alignItems: "center" }}>
//                       <Image sx={{ mr: 1.5, color: "#FF416C" }} />
//                       <Typography>Photo + GIF</Typography>
//                     </Box>
//                   </MenuItem>
//                   <MenuItem value="videophoto">
//                     <Box sx={{ display: "flex", alignItems: "center" }}>
//                       <Videocam sx={{ mr: 1.5, color: "#FF416C" }} />
//                       <Typography>Video + Photo</Typography>
//                     </Box>
//                   </MenuItem>
//                 </Select>
//               </FormControl>

//               <Box component="form" onSubmit={handleSubmit}>
//                 {/* <Grid container spacing={3}>
//                   <Grid item xs={12}> */}
//                 <TextField
//                   name="name"
//                   label={
//                     <Box sx={{ display: "flex", alignItems: "center" }}>
//                       <PersonOutline
//                         sx={{
//                           mr: 1.5,
//                           fontSize: 24,
//                           color: "#FF416C",
//                         }}
//                       />
//                       Project Name
//                     </Box>
//                   }
//                   fullWidth
//                   required
//                   onChange={handleChange}
//                   variant="outlined"
//                   size="medium"
//                   value={formData.name}
//                   sx={{
//                     mb: 2,
//                     "& .MuiInputLabel-root": {
//                       color: "rgba(255, 255, 255, 0.7)",
//                     },
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "12px",
//                       color: "white",
//                       "& fieldset": {
//                         borderColor: "rgba(255, 255, 255, 0.2)",
//                       },
//                       "&:hover fieldset": {
//                         borderColor: "#FF416C",
//                       },
//                       "&.Mui-focused fieldset": {
//                         borderColor: "#FF416C",
//                       },
//                     },
//                   }}
//                 />
//                 {/* </Grid> */}

//                 {/* <Grid item xs={12}> */}
//                 <TextField
//                   name="date"
//                   label={
//                     <Box sx={{ display: "flex", alignItems: "center" }}>
//                       <CalendarToday
//                         sx={{
//                           mr: 1.5,
//                           fontSize: 24,
//                           color: "#FF416C",
//                         }}
//                       />
//                       Date
//                     </Box>
//                   }
//                   type="date"
//                   fullWidth
//                   required
//                   onChange={handleChange}
//                   variant="outlined"
//                   size="medium"
//                   InputLabelProps={{ shrink: true }}
//                   value={formData.date}
//                   sx={{
//                     mb: 1,
//                     "& .MuiInputLabel-root": {
//                       color: "rgba(255, 255, 255, 0.7)",
//                     },
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "12px",
//                       color: "white",
//                       "& fieldset": {
//                         borderColor: "rgba(255, 255, 255, 0.2)",
//                       },
//                       "&:hover fieldset": {
//                         borderColor: "#FF416C",
//                       },
//                       "&.Mui-focused fieldset": {
//                         borderColor: "#FF416C",
//                       },
//                     },
//                   }}
//                 />
//                 {/* </Grid> */}
//                 {/* <Divider sx={{ my: 2 }} /> */}
//                 <Grid
//                   container
//                   spacing={4}
//                   sx={{
//                     mb: 1,
//                     display: "flex",
//                     flexDirection: "row",
//                     justifyContent: "space-evenly",
//                   }}
//                 >
//                   {renderFileUploads()}
//                 </Grid>

//                 {/* <Grid item xs={12} sx={{ mt: 2 }}> */}
//                 <GradientButton
//                   sx={{ mb: 1 }}
//                   type="submit"
//                   disabled={
//                     uploading ||
//                     !formData.name ||
//                     !formData.date ||
//                     (mediaType === "videovideo" &&
//                       (!formData.video || !formData.gif)) ||
//                     (mediaType === "photogif" &&
//                       (!formData.photo || !formData.gif)) ||
//                     (mediaType === "videophoto" &&
//                       (!formData.video || !formData.photo))
//                   }
//                   startIcon={<CloudUpload sx={{ fontSize: 24 }} />}
//                   fullWidth
//                 >
//                   {uploading ? (
//                     <>
//                       <CircularProgress
//                         size={24}
//                         sx={{ mr: 2, color: "white" }}
//                       />
//                       Creating Magic...
//                     </>
//                   ) : (
//                     `Generate ${mediaType
//                       .replace("video", "Video")
//                       .replace("gif", "GIF")
//                       .replace("photo", "Photo")}`
//                   )}
//                 </GradientButton>
//                 {/* </Grid> */}
//                 {/* </Grid> */}
//               </Box>
//             </Box>
//           </Grid>

//           {/* Right Column - Preview */}
//           <Grid item xs={12} md={6}>
//             <Box
//               sx={{
//                 p: 2,
//                 width: 500,
//                 borderRadius: "16px",
//                 height: "100%",
//                 background: "rgba(255, 255, 255, 0.05)",
//                 backdropFilter: "blur(10px)",
//                 border: "1px solid rgba(255, 255, 255, 0.1)",
//                 boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
//                 display: "flex",
//                 flexDirection: "column",
//               }}
//             >
//               <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
//                 <AutoAwesome
//                   sx={{
//                     fontSize: 32,
//                     mr: 2,
//                     color: "#FF416C",
//                   }}
//                 />
//                 <Typography
//                   variant="h5"
//                   sx={{
//                     fontWeight: 700,
//                     color: "white",
//                   }}
//                 >
//                   Output Poster
//                 </Typography>
//               </Box>
//               <Divider
//                 sx={{
//                   mb: 1.5,
//                   borderColor: "rgba(255, 255, 255, 0.1)",
//                 }}
//               />

//               <Box
//                 sx={{
//                   flex: 1,
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   borderRadius: "12px",
//                   backgroundColor: "rgba(255, 255, 255, 0.03)",
//                   border: "2px dashed rgba(255, 255, 255, 0.1)",
//                   //minHeight: 450,
//                   position: "relative",
//                   overflow: "hidden",
//                 }}
//               >
//                 {uploading && (
//                   <Box
//                     sx={{
//                       textAlign: "center",
//                       p: 2,
//                       backgroundColor: "rgba(0, 0, 0, 0.5)",
//                       borderRadius: "12px",
//                       maxWidth: 400,
//                     }}
//                   >
//                     <CircularProgress
//                       size={80}
//                       thickness={4}
//                       sx={{
//                         color: "#FF416C",
//                         mb: 3,
//                       }}
//                     />
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         mb: 1,
//                         fontWeight: 600,
//                         color: "white",
//                       }}
//                     >
//                       Creating your masterpiece
//                     </Typography>
//                     <Typography
//                       variant="body2"
//                       sx={{ color: "rgba(255, 255, 255, 0.7)" }}
//                     >
//                       Our AI is working its magic...
//                     </Typography>
//                   </Box>
//                 )}

//                 {!media && !uploading && (
//                   <Box
//                     sx={{
//                       textAlign: "center",
//                       p: 4,
//                       maxWidth: 400,
//                     }}
//                   >
//                     <Box
//                       sx={{
//                         width: 140,
//                         height: 140,
//                         borderRadius: "50%",
//                         backgroundColor: "rgba(255, 65, 108, 0.1)",
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                         mx: "auto",
//                         mb: 3,
//                         border: "2px dashed rgba(255, 65, 108, 0.3)",
//                       }}
//                     >
//                       <Image
//                         sx={{
//                           fontSize: 60,
//                           color: "rgba(255, 65, 108, 0.5)",
//                         }}
//                       />
//                     </Box>
//                     <Typography
//                       variant="h6"
//                       sx={{
//                         mb: 1,
//                         fontWeight: 600,
//                         color: "white",
//                       }}
//                     >
//                       Your visual masterpiece awaits
//                     </Typography>
//                     <Typography
//                       variant="body2"
//                       sx={{ color: "rgba(255, 255, 255, 0.7)" }}
//                     >
//                       Configure your settings and generate a preview
//                     </Typography>
//                   </Box>
//                 )}

//                 {media?.photoId && (
//                   <Fade in={true} timeout={500}>
//                     <StyledCard>
//                       <Box sx={{ position: "relative" }}>
//                         <CardMedia
//                           component="img"
//                           image={media.url}
//                           alt="Poster Preview"
//                           sx={{
//                             width: "100%",
//                             height: "auto",
//                             maxHeight: 400,
//                             objectFit: "cover",
//                           }}
//                         />
//                         <Box
//                           sx={{
//                             position: "absolute",
//                             top: 0,
//                             left: 0,
//                             right: 0,
//                             bottom: 0,
//                             background:
//                               "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
//                             display: "flex",
//                             alignItems: "flex-end",
//                             p: 3,
//                           }}
//                         >
//                           <Typography
//                             variant="h6"
//                             sx={{ color: "white", fontWeight: 600 }}
//                           >
//                             {formData.name || "Your Poster"}
//                           </Typography>
//                         </Box>
//                       </Box>
//                       <CardContent
//                         sx={{
//                           backgroundColor: "rgba(0, 0, 0, 0.3)",
//                           borderTop: "1px solid rgba(255, 255, 255, 0.1)",
//                         }}
//                       >
//                         <Grid container spacing={2}>
//                           <Grid item xs={6}>
//                             <Button
//                               variant="contained"
//                               sx={{
//                                 background:
//                                   "linear-gradient(45deg, #FF416C 0%, #FF4B2B 100%)",
//                                 color: "white",
//                                 borderRadius: "8px",
//                                 py: 1.5,
//                                 fontWeight: 600,
//                                 boxShadow: "none",
//                                 "&:hover": {
//                                   boxShadow:
//                                     "0 4px 15px rgba(255, 75, 43, 0.4)",
//                                 },
//                                 width: "100%",
//                               }}
//                               startIcon={<Download />}
//                             >
//                               Download
//                             </Button>
//                           </Grid>
//                           {/* <Grid item xs={6}>
//                             <Button
//                               variant="outlined"
//                               sx={{
//                                 color: 'white',
//                                 borderColor: 'rgba(255, 255, 255, 0.3)',
//                                 borderRadius: '8px',
//                                 py: 1.5,
//                                 fontWeight: 600,
//                                 '&:hover': {
//                                   borderColor: 'white'
//                                 },
//                                 width: '100%'
//                               }}
//                               startIcon={<LinearScale />}
//                             >
//                               Resize
//                             </Button>
//                           </Grid> */}
//                         </Grid>
//                       </CardContent>
//                     </StyledCard>
//                   </Fade>
//                 )}
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// }

// export default CreatePosterPage;