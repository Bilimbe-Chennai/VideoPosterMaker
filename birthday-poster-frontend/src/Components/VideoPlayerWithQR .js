import { useState, useRef,useEffect } from "react";
import { Box, Card, CardMedia, CardContent } from "@mui/material";

const VideoPlayerWithQR = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  const handleEnded = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const isVideoPhoto = videos?.type === "videophoto";
  const currentVideoId = isVideoPhoto
    ? videos[currentIndex].mergedVideoId
    : videos[currentIndex].posterVideoId;
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        position: "relative",
        // height: 500,
       // width:"100%",
        gap: 2,
      }}
    >
      <Card sx={{ borderRadius: 3,height:"70%",width:"70%"}}>
        <CardMedia
          component="video"
          key={currentVideoId}
          ref={videoRef}
          src={`https://api.bilimbebrandactivations.com/api/upload/file/${currentVideoId}?download=true`}
          controls
          autoPlay
          //muted   
          onEnded={handleEnded}
          sx={{
            borderRadius: 3,
            // width: "100%",
            // height: "100%",
            objectFit: "contain",
          }}
        />
      </Card>

      {/* QR Code Section */}
      {videos[currentIndex].qrCode && (
        <Card sx={{
                height:"50%",
                width:"50%",
              }} >
          <CardMedia>
            <Box
              component="img"
              src={videos[currentIndex].qrCode}
              alt="QR Code"
              sx={{
                height:"100%",
                width:"100%",
                objectFit:"contain"
              }}
            />
          </CardMedia>
        </Card>
      )}
    </Box>
  );
};

export default VideoPlayerWithQR;
