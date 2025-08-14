import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  IconButton
} from '@mui/material';
import useAxios from "../useAxios";
import { Upload as UploadIcon, Download, PlayArrow, Pause,List  } from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
function Singleoptionsupload() {
  const axiosData = useAxios();
  const [formData, setFormData] = useState({ name: '', date: '', photo: null, gif: null });
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMedia(null)
    setUploading(true);
    try {
      const uploadData = new FormData();
      Object.entries(formData).forEach(([key, val]) => uploadData.append(key, val));
      const res = await axiosData.post('upload/videogif', uploadData ,{
  headers: {
    "Content-Type": "multipart/form-data"
  }
});
      setMedia(res.data.media);
      setShowPoster(false);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Check server and FFmpeg setup.');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4"  
        sx={{ 
          fontWeight: 700, 
          color: '#a91111ff',
          textTransform: 'uppercase',
          textAlign:"center",
          letterSpacing: 1
        }}>
          Video Poster Generator
        </Typography>
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
        <Grid container spacing={3} sx={{ display:"flex",flexDirection:"row",justifyContent:"space-between"}}>
          <Grid item xs={12} md={6} sx={{width:500}}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6"sx={{ mb: 2, fontWeight: 600 ,textAlign:"center",color:"#a91111ff"}}>Create Your Poster Video</Typography>
              <Divider sx={{ mb: 3 }} />
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    name="name"
                    label="Name"
                    fullWidth
                    required
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                    color="error"
                  />
                  
                  <TextField
                    name="date"
                    label="Date"
                    type="date"
                    fullWidth
                    required
                    onChange={handleChange}
                    variant="outlined"
                    color="error"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <Button
                    variant="contained"
                    component="label"
                    color="error"
                    startIcon={<UploadIcon />}
                    sx={{ py: 1.5 }}
                    fullWidth
                  >
                    Upload Photo
                    <input type="file" name="photo" hidden onChange={handleChange} accept="image/*" />
                  </Button>
                  
                  <Button
                    variant="contained"
                    component="label"
                    color="error"
                    startIcon={<UploadIcon />}
                    sx={{ py: 1.5 }}
                    fullWidth
                  >
                    Upload Video
                    <input type="file" name="gif" hidden onChange={handleChange} accept="gif/*" />
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="error"
                    type="submit"
                    disabled={uploading}
                    sx={{ py: 1.5, fontWeight: 600 }}
                    fullWidth
                  >
                    {uploading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        Processing...
                      </>
                    ) : 'Generate Poster & Video'}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
          
           <Grid item xs={12} md={6}  sx={{width:500}}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, height: 425 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600,textAlign:"center" ,color:"#a91111ff"}}>Generated Output</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {uploading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                  <CircularProgress size={60} />
                </Box>
              )}
              {!media && !uploading&& (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                 <Typography>No Video Created</Typography>
                </Box>
              )}
              {/* {media?.mergedVideoId && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Final Result</Typography>
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                    <video
                      src={`https://bilimbe-bday-poster-backend.onrender.com/api/upload/file/${media.mergedVideoId}`}
                      width="100%"
                      controls
                      autoPlay
                      style={{ borderRadius: '8px' }}
                    />
                  </Box>
                </Box>
              )} */}
              
              {/* {media?.videoId && !showPoster && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Original Video</Typography>
                  <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
                    <video
                      ref={videoRef}
                      src={`https://bilimbe-bday-poster-backend.onrender.com/api/upload/file/${media.videoId}`}
                      width="100%"
                      style={{ borderRadius: '8px' }}
                      onClick={togglePlay}
                    />
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isPlaying ? 0 : 1,
                      transition: 'opacity 0.3s',
                      '&:hover': { opacity: 1 }
                    }}>
                      <IconButton 
                        onClick={togglePlay}
                        sx={{ 
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
                          color: 'white',
                          width: 64,
                          height: 64
                        }}
                      >
                        {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              )} */}
              
              {media?.photoId && (
                <Box>
                  <Card sx={{ borderRadius: 2, mb: 2 }}>
                    <CardMedia 
                      component="img"
                      image={`http://localhost:5000/api/upload/file/${media?.photoId}`}
                      alt="Poster"
                      sx={{ maxHeight: 240, objectFit: 'contain' }}
                    />
                    <CardContent sx={{ pt: 1 }}>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          color='error'
                          startIcon={<Download />}
                          href={`http://localhost:5000/api/upload/file/${media?.posterId}?download=true`}
                          download="poster.png"
                          fullWidth
                        >
                          Poster
                        </Button>
                        <Button
                          variant="outlined"
                          color='error'
                          startIcon={<Download />}
                          href={`http://localhost:5000/api/upload/file/${media?.posterVideoId}?download=true`}
                          download="final-video.mp4"
                          fullWidth
                        >
                          Video
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Singleoptionsupload;