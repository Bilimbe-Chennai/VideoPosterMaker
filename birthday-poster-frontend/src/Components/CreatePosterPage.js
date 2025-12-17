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
  Edit,
  CheckCircle,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import AddchartIcon from "@mui/icons-material/Addchart";
import { Event } from "@mui/icons-material";
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
  const [faceSwap, setFaceSwap] = useState(false);
  const [congratsOption, setCongratsOption] = useState(false);
  const [video1TextOption, setVideo1TextOption] = useState(false);
  const [video2TextOption, setVideo2TextOption] = useState(false);
  const [video3TextOption, setVideo3TextOption] = useState(false);
  const [mergingOption, setMergingOption] = useState(false);
  const [clientname, setClientname] = useState("");
  const [brandname, setBrandname] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [approved, setApproved] = useState(false);
  const [editedVideo, setEditedVideo] = useState({
    title: "",
    description: "",
    tags: "",
    isPublic: false,
  });
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [originalMediaData, setOriginalMediaData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    date: dayjs(),
    type: "",
    photo: null,
    gif: null,
    video: null,
    video1: null,
    video2: null,
    video3: null,
    audio: null,
    //samplevideo: null,
    boyvideo1: null,
    girlvideo1: null,
    childboyvideo1: null,
    childgirlvideo1: null,
    boyvideo2: null,
    girlvideo2: null,
    childboyvideo2: null,
    childgirlvideo2: null,
    boyvideo3: null,
    girlvideo3: null,
    childboyvideo3: null,
    childgirlvideo3: null,
    boyvideo4: null,
    girlvideo4: null,
    childboyvideo4: null,
    childgirlvideo4: null,
  });
  console.log(formData.date)
  const [fileNames, setFileNames] = useState({
    photo: "",
    gif: "",
    video: "",
    video1: "",
    video2: "",
    video3: "",
    audio: "",
    //samplevideo: "",
    boyvideo1: "",
    girlvideo1: "",
    childboyvideo1: "",
    childgirlvideo1: "",
    boyvideo2: "",
    girlvideo2: "",
    childboyvideo2: "",
    childgirlvideo2: "",
    boyvideo3: "",
    girlvideo3: "",
    childboyvideo3: "",
    childgirlvideo3: "",
    boyvideo4: "",
    girlvideo4: "",
    childboyvideo4: "",
    childgirlvideo4: "",
  });
  const [loading, setLoading] = useState(false);
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
  // Update these functions to use the correct variable names
  const handleApproveVideo = async () => {
    try {
      const response = await axiosData.post(
        `admin/approve/${media?._id}`,
        {
          approved: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setMedia((prev) => ({
          ...prev,
          approved: true,
          approvedAt: new Date().toISOString(),
        }));
        // alert("Video approved successfully!");
      } else {
        throw new Error("Failed to approve video");
      }
    } catch (error) {
      console.error("Error approving video:", error);
      alert("Failed to approve video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelEdit = () => {
    if (isEditingExisting) {
      // Reset form to original state
      if (originalMediaData) {
        setFormData(originalMediaData.formData);
        setClientname(originalMediaData.clientname);
        setBrandname(originalMediaData.brandname);
        setCongratsOption(originalMediaData.congratsOption);
        setVideo1TextOption(originalMediaData.video1TextOption);
        setVideo2TextOption(originalMediaData.video2TextOption);
        setVideo3TextOption(originalMediaData.video3TextOption);

        // Reset file names
        const updatedFileNames = { ...fileNames };
        Object.keys(originalMediaData.fileNames).forEach((key) => {
          updatedFileNames[key] = originalMediaData.fileNames[key];
        });
        setFileNames(updatedFileNames);
      }
    }

    setEditedVideo({
      title: media?.title || "",
      description: media?.description || "",
      tags: media?.tags || "",
      isPublic: media?.isPublic || false,
    });
    setIsEditMode(false);
    setIsEditingExisting(false);
  };

  const handleEditClick = () => {
    if (!media) return;

    // console.log("Editing media ID:", media._id);

    // Populate form with existing data
    // For text fields:
    setFormData((prev) => ({
      ...prev,
      name: media.name || "",
      date: media.date
        ? media.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
    }));

    // For options:
    setClientname(media.clientname || "");
    setBrandname(media.brandname || "");
    setCongratsOption(media.congratsOption || false);
    setVideo1TextOption(media.video1TextOption || false);
    setVideo2TextOption(media.video2TextOption || false);
    setVideo3TextOption(media.video3TextOption || false);
    setFaceSwap(media.faceSwap || false);
    setMergingOption(media.videosMergeOption || false);

    // For files - show existing file names
    const updatedFileNames = { ...fileNames };

    // Clear all
    Object.keys(updatedFileNames).forEach((key) => {
      updatedFileNames[key] = "";
    });

    // Set existing files
    if (media.video1Id) updatedFileNames.video1 = media.video1Id;
    if (media.video2Id) updatedFileNames.video2 = media.video2Id;
    if (media.video3Id) updatedFileNames.video3 = media.video3Id;
    if (media.audioId) updatedFileNames.audio = media.audioId;

    setFileNames(updatedFileNames);

    // Enable edit mode
    setIsEditMode(true);
    setIsEditingExisting(true);
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
    setFileNames({
      photo: "",
      gif: "",
      video: "",
      video1: "",
      video2: "",
      video3: "",
      audio: "",
      //samplevideo: "",
      boyvideo1: "",
      girlvideo1: "",
      childboyvideo1: "",
      childgirlvideo1: "",
      boyvideo2: "",
      girlvideo2: "",
      childboyvideo2: "",
      childgirlvideo2: "",
      boyvideo3: "",
      girlvideo3: "",
      childboyvideo3: "",
      childgirlvideo3: "",
      boyvideo4: "",
      girlvideo4: "",
      childboyvideo4: "",
      childgirlvideo4: "",
    });
    setMedia(null);
  };
  const shareOnWhatsApp = async () => {
    setLoading(true)
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
  const resetForm = () => {
    setFormData({
      name: "",
      date: new Date().toISOString().split("T")[0],
      type: "",
      photo: null,
      gif: null,
      video: null,
      video1: null,
      video2: null,
      video3: null,
      audio: null,
      boyvideo1: null,
      girlvideo1: null,
      childboyvideo1: null,
      childgirlvideo1: null,
      boyvideo2: null,
      girlvideo2: null,
      childboyvideo2: null,
      childgirlvideo2: null,
      boyvideo3: null,
      girlvideo3: null,
      childboyvideo3: null,
      childgirlvideo3: null,
      boyvideo4: null,
      girlvideo4: null,
      childboyvideo4: null,
      childgirlvideo4: null,
    });

    setFileNames({
      photo: "",
      gif: "",
      video: "",
      video1: "",
      video2: "",
      video3: "",
      audio: "",
      boyvideo1: "",
      girlvideo1: "",
      childboyvideo1: "",
      childgirlvideo1: "",
      boyvideo2: "",
      girlvideo2: "",
      childboyvideo2: "",
      childgirlvideo2: "",
      boyvideo3: "",
      girlvideo3: "",
      childboyvideo3: "",
      childgirlvideo3: "",
      boyvideo4: "",
      girlvideo4: "",
      childboyvideo4: "",
      childgirlvideo4: "",
    });

    setClientname("");
    setBrandname("");
    setCongratsOption(false);
    setVideo1TextOption(false);
    setVideo2TextOption(false);
    setVideo3TextOption(false);
    setFaceSwap(false);
    setMergingOption(false);
    setIsEditMode(false);
    setIsEditingExisting(false);
    setOriginalMediaData(null);
    setUploading(false);
  };
  const handleSaveEdit = async () => {
    try {
      setUploading(true);

      const uploadData = new FormData();

      // Add all text fields
      uploadData.append("name", formData.name);
      uploadData.append("clientname", clientname);
      uploadData.append("brandname", brandname);
      uploadData.append("date", formData.date.format("DD/MM/YYYY"));
      uploadData.append("type", mediaType);
      uploadData.append("congratsOption", congratsOption);
      uploadData.append("video1TextOption", video1TextOption);
      uploadData.append("video2TextOption", video2TextOption);
      uploadData.append("video3TextOption", video3TextOption);
      uploadData.append("title", editedVideo.title);
      uploadData.append("description", editedVideo.description);
      uploadData.append("tags", editedVideo.tags);
      uploadData.append("isPublic", editedVideo.isPublic);

      // Only append files if they were changed
      const fileFields = ["video1", "video2", "video3", "audio"];
      fileFields.forEach((field) => {
        if (formData[field] && typeof formData[field] !== "string") {
          uploadData.append(field, formData[field]);
        }
      });

      const response = await axiosData.post(
        `upload/update/${media?._id}`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setMedia(response.data.media);
        setIsEditMode(false);
        setIsEditingExisting(false);
        // alert("Video updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update video");
      }
    } catch (error) {
      console.error("Error updating video:", error);
      alert(error.message || "Failed to update video. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!isEditMode || !isEditingExisting) {
  //       setMedia(null);
  //   }
  //   setUploading(true);
  //   try {
  //     const uploadData = new FormData();
  //     Object.entries(formData).forEach(([key, val]) => {
  //       if (val) uploadData.append(key, val);
  //     });
  //     uploadData.append("faceSwap", faceSwap);
  //     uploadData.append("videosMergeOption", mergingOption);
  //     uploadData.append("congratsOption", congratsOption);
  //     uploadData.append("video1TextOption", video1TextOption);
  //     uploadData.append("video2TextOption", video2TextOption);
  //     uploadData.append("video3TextOption", video3TextOption);
  //     uploadData.append("clientname", clientname);
  //     uploadData.append("brandname", brandname);
  //     uploadData.append("approved", approved);
  //     // Append the mediaType to the form data
  //     uploadData.append("type", mediaType);
  //       // If editing, send the _id and isEdit flag
  //       if (isEditMode && isEditingExisting && media?._id) {
  //           uploadData.append("_id", media._id);
  //           uploadData.append("isEdit", "true");
  //       }
  //      console.log("uploadData",uploadData)
  //     let endpoint;
  //     if (mediaType === "videovideo") {
  //       endpoint = `admin/settings`;
  //     }if (mediaType === "videovideovideo") {
  //       endpoint = `admin/settings/videovideovideo`;
  //     } else {
  //       endpoint = `upload/${mediaType}`;
  //     }
  //     const res = await axiosData.post(endpoint, uploadData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });
  //     // if(mediaType === "videovideovideo"){

  //     // }
  //       if (res.data.media) {
  //     console.log("datares",res.data)
  //     setMedia(res.data.media);
  //     setQrCode(res.data.qrCode);
  //       if (isEditMode && isEditingExisting) {
  //               setIsEditMode(false);
  //               setIsEditingExisting(false);
  //               alert('Video updated successfully!');
  //           } else {
  //               alert('Video created successfully!');
  //           }
  //     //resetForm()
  //       }else {
  //           throw new Error("No media data returned");
  //       }
  //   } catch (err) {
  //     console.error("Upload error:", err);
  //     alert("Upload failed.");
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't reset media if we're editing
    if (!isEditMode || !isEditingExisting) {
      setMedia(null);
    }

    setUploading(true);

    try {
      const uploadData = new FormData();

      // ================================
      // 1. ALWAYS SEND THESE BASIC FIELDS (All Media Types)
      // ================================
      uploadData.append("name", formData.name);
      uploadData.append("date", formData.date.format("DD/MM/YYYY"));
      uploadData.append("type", mediaType);
      // ================================
      // 2. ADD TYPE-SPECIFIC FIELDS
      // ================================

      // For videovideo type
      if (mediaType === "videovideo") {
        uploadData.append("faceSwap", faceSwap);
        uploadData.append("videosMergeOption", mergingOption);

        // Send video files
        if (formData.video1) uploadData.append("video1", formData.video1);
        if (formData.video2) uploadData.append("video2", formData.video2);
        if (formData.audio) uploadData.append("audio", formData.audio);

        // Send face swap videos if enabled
        if (faceSwap) {
          if (formData.boyvideo1)
            uploadData.append("boyvideo1", formData.boyvideo1);
          if (formData.girlvideo1)
            uploadData.append("girlvideo1", formData.girlvideo1);
          if (formData.childboyvideo1)
            uploadData.append("childboyvideo1", formData.childboyvideo1);
          if (formData.childgirlvideo1)
            uploadData.append("childgirlvideo1", formData.childgirlvideo1);

          if (formData.boyvideo2)
            uploadData.append("boyvideo2", formData.boyvideo2);
          if (formData.girlvideo2)
            uploadData.append("girlvideo2", formData.girlvideo2);
          if (formData.childboyvideo2)
            uploadData.append("childboyvideo2", formData.childboyvideo2);
          if (formData.childgirlvideo2)
            uploadData.append("childgirlvideo2", formData.childgirlvideo2);

          if (formData.boyvideo3)
            uploadData.append("boyvideo3", formData.boyvideo3);
          if (formData.girlvideo3)
            uploadData.append("girlvideo3", formData.girlvideo3);
          if (formData.childboyvideo3)
            uploadData.append("childboyvideo3", formData.childboyvideo3);
          if (formData.childgirlvideo3)
            uploadData.append("childgirlvideo3", formData.childgirlvideo3);

          if (formData.boyvideo4)
            uploadData.append("boyvideo4", formData.boyvideo4);
          if (formData.girlvideo4)
            uploadData.append("girlvideo4", formData.girlvideo4);
          if (formData.childboyvideo4)
            uploadData.append("childboyvideo4", formData.childboyvideo4);
          if (formData.childgirlvideo4)
            uploadData.append("childgirlvideo4", formData.childgirlvideo4);
        }
      }

      // For videovideovideo type
      else if (mediaType === "videovideovideo") {
        uploadData.append("clientname", clientname);
        uploadData.append("brandname", brandname);
        uploadData.append("congratsOption", congratsOption);
        uploadData.append("video1TextOption", video1TextOption);
        uploadData.append("video2TextOption", video2TextOption);
        uploadData.append("video3TextOption", video3TextOption);

        // Send video files
        if (formData.video1) uploadData.append("video1", formData.video1);
        if (formData.video2) uploadData.append("video2", formData.video2);
        if (formData.video3) uploadData.append("video3", formData.video3);
        if (formData.audio) uploadData.append("audio", formData.audio);
      }

      // For photogif type
      else if (mediaType === "photogif") {
        if (formData.photo) uploadData.append("photo", formData.photo);
        if (formData.gif) uploadData.append("gif", formData.gif);
      }

      // For videophoto type
      else if (mediaType === "videophoto") {
        if (formData.video) uploadData.append("video", formData.video);
        if (formData.photo) uploadData.append("photo", formData.photo);
      }

      // ================================
      // 3. HANDLE EDIT MODE (All Types)
      // ================================
      if (isEditMode && isEditingExisting && media?._id) {
        uploadData.append("_id", media._id);
        uploadData.append("isEdit", "true");

        // For edit mode, we need to handle files that weren't changed
        // Your backend should keep existing files if not provided
        // So we only append files that actually exist in formData

        // console.log("Edit mode - Media ID:", media._id);
        // console.log("Files to send:", {
        //   video1: formData.video1 ? "Yes" : "No",
        //   video2: formData.video2 ? "Yes" : "No",
        //   video3: formData.video3 ? "Yes" : "No",
        //   audio: formData.audio ? "Yes" : "No",
        //   photo: formData.photo ? "Yes" : "No",
        //   gif: formData.gif ? "Yes" : "No",
        // });
      }

      // ================================
      // 4. DETERMINE ENDPOINT
      // ================================
      let endpoint;
      if (mediaType === "videovideo") {
        endpoint = `admin/settings`;
      } else if (mediaType === "videovideovideo") {
        endpoint = `admin/settings/videovideovideo`;
      } else {
        endpoint = `upload/${mediaType}`;
      }

      // console.log("Submitting to:", endpoint);
      // console.log("Media Type:", mediaType);
      // console.log("Mode:", isEditMode && isEditingExisting ? "EDIT" : "CREATE");

      // ================================
      // 5. VALIDATION CHECKS
      // ================================
      // Skip validation for edit mode (files might not be changed)
      if (!isEditMode || !isEditingExisting) {
        let validationError = "";

        if (mediaType === "videovideo") {
          if (
            !faceSwap &&
            mergingOption &&
            (!formData.video1 || !formData.video2 || !formData.audio)
          ) {
            validationError =
              "For video merging, please upload Video 1, Video 2, and Audio";
          }
          if (faceSwap && !mergingOption) {
            if (
              !formData.boyvideo1 ||
              !formData.girlvideo1 ||
              !formData.childboyvideo1 ||
              !formData.childgirlvideo1
            ) {
              validationError =
                "For face swap, please upload all required videos";
            }
          }
          if (faceSwap && mergingOption) {
            if (
              !formData.video2 ||
              !formData.boyvideo1 ||
              !formData.girlvideo1 ||
              !formData.childboyvideo1 ||
              !formData.childgirlvideo1 ||
              !formData.audio
            ) {
              validationError =
                "For face swap with merging, please upload all required videos and audio";
            }
          }
        } else if (mediaType === "videovideovideo") {
          if (!formData.video1 || !formData.video2 || !formData.video3) {
            validationError = "Please upload all three videos";
          }
        } else if (mediaType === "photogif") {
          if (!formData.photo || !formData.gif) {
            validationError = "Please upload both photo and GIF";
          }
        } else if (mediaType === "videophoto") {
          if (!formData.video || !formData.photo) {
            validationError = "Please upload both video and photo";
          }
        }

        if (validationError) {
          alert(validationError);
          setUploading(false);
          return;
        }
      }

      // ================================
      // 6. MAKE THE REQUEST
      // ================================
      const response = await axiosData.post(endpoint, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // console.log("Response:", response.data);

      if (response.data.media) {
        setMedia(response.data.media);

        // Update QR code if provided
        if (response.data.qrCode) {
          setQrCode(response.data.qrCode);
        }

        if (isEditMode && isEditingExisting) {
          setIsEditMode(false);
          setIsEditingExisting(false);
          // alert(
          //   `${mediaType
          //     .replace("video", "Video")
          //     .replace("gif", "GIF")
          //     .replace("photo", "Photo")} updated successfully!`
          // );

          // Update file names with new IDs
          const updatedFileNames = { ...fileNames };
          const fileIdFields = [
            "video1Id",
            "video2Id",
            "video3Id",
            "audioId",
            "photoId",
            "gifId",
            "videoId",
          ];

          fileIdFields.forEach((fieldId) => {
            const fieldName = fieldId.replace("Id", "");
            if (response.data.media[fieldId]) {
              updatedFileNames[
                fieldName
              ] = `Existing: ${response.data.media[fieldId]}`;
            }
          });

          setFileNames(updatedFileNames);
        } else {
          // alert(
          //   `${mediaType
          //     .replace("video", "Video")
          //     .replace("gif", "GIF")
          //     .replace("photo", "Photo")} created successfully!`
          // );
        }

        // Reset form if not in edit mode
        if (!isEditMode) {
          resetForm();
        }
      } else {
        throw new Error("No media data returned from server");
      }
    } catch (err) {
      console.error("Upload error:", err);

      if (isEditMode && isEditingExisting) {
        alert(
          `${mediaType
            .replace("video", "Video")
            .replace("gif", "GIF")
            .replace("photo", "Photo")} update failed. Please try again.`
        );
      } else {
        alert(
          `${mediaType
            .replace("video", "Video")
            .replace("gif", "GIF")
            .replace("photo", "Photo")} creation failed. Please try again.`
        );
      }
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
          disabled: !mergingOption || (mergingOption && faceSwap),
        },
        {
          name: "video2",
          label: "Upload Second Video",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !mergingOption,
        },
        {
          name: "boyvideo1",
          label: "Upload Boy Video 1",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "boyvideo2",
          label: "Upload Boy Video 2",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "boyvideo3",
          label: "Upload Boy Video 3",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "boyvideo4",
          label: "Upload Boy Video 4",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "girlvideo1",
          label: "Upload Girl Video 1",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "girlvideo2",
          label: "Upload Girl Video 2",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "girlvideo3",
          label: "Upload Girl Video 3",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "girlvideo4",
          label: "Upload Girl Video 4",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childgirlvideo1",
          label: "Upload Child Girl Video 1",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childgirlvideo2",
          label: "Upload Child Girl Video 2",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childgirlvideo3",
          label: "Upload Child Girl Video 3",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childgirlvideo4",
          label: "Upload Child Girl Video 4",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childboyvideo1",
          label: "Upload Child Boy Video 1",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childboyvideo2",
          label: "Upload Child Boy Video 2",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childboyvideo3",
          label: "Upload Child Boy Video 3",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        {
          name: "childboyvideo4",
          label: "Upload Child Boy Video 4",
          icon: <Videocam />,
          accept: "video/*",
          disabled: !faceSwap,
        },
        // {
        //   name: "samplevideo",
        //   label: "Upload Sample Video",
        //   icon: <Videocam />,
        //   accept: "video/*",
        // },
        {
          name: "audio",
          label: "Upload Audio",
          icon: <AudiotrackIcon />,
          accept: "audio/*,.mp3,.m4a,.aac,.wav",
          disabled: !mergingOption && faceSwap,
        },
      ],
      videovideovideo: [
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
        {
          name: "video3",
          label: "Upload Third Video",
          icon: <Videocam />,
          accept: "video/*",
        },
        {
          name: "audio",
          label: "Upload Audio",
          icon: <AudiotrackIcon />,
          accept: "audio/*,.mp3,.m4a,.aac,.wav",
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

    return uploadOptions[mediaType].map(
      (input) =>
        !input.disabled && (
          <Grid item xs={12} md={6} key={input.name}>
            <FileUploadBox sx={{ width: 205 }}>
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
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {input.label}
                  </Typography>
                  <Typography variant="caption">
                    {isEditingExisting && media?.[`${input.name}Id`]
                      ? "Click to replace"
                      : input.accept.includes("video")
                      ? "MP4, MOV, AVI"
                      : input.accept.includes("gif")
                      ? "GIF format"
                      : input.accept.includes("audio")
                      ? "(MP3)"
                      : "JPG, PNG"}
                  </Typography>
                </Box>
              </label>
              {/* Show existing file info when in edit mode */}
              {isEditingExisting &&
                media?.[`${input.name}Id`] &&
                !fileNames[input.name] && (
                  <Fade in={true}>
                    <Chip
                      label={`Current: ${media[`${input.name}Id`].substring(
                        0,
                        10
                      )}...`}
                      sx={{
                        mt: 2,
                        backgroundColor: "rgba(0, 128, 0, 0.2)",
                        color: "#006400",
                        border: "1px solid rgba(0, 128, 0, 0.5)",
                        borderRadius: "8px",
                        height: "auto",
                        py: 0.5,
                      }}
                      avatar={
                        <Avatar
                          sx={{
                            bgcolor: "rgba(0, 128, 0, 0.3)",
                            color: "#006400",
                          }}
                        >
                          {input.icon}
                        </Avatar>
                      }
                    />
                  </Fade>
                )}
              {fileNames[input.name] && (
                <Fade in={true}>
                  <Chip
                    label={fileNames[input.name]}
                    onDelete={() => handleRemoveFile(input.name)}
                    deleteIcon={<Close />}
                    sx={{
                      mt: 2,
                      backgroundColor: isEditingExisting
                        ? "rgba(255, 165, 0, 0.2)"
                        : "rgba(211, 47, 47, 0.2)",
                      color: isEditingExisting ? "#FF8C00" : "#b92828",
                      border: `1px solid ${
                        isEditingExisting
                          ? "rgba(255, 165, 0, 0.5)"
                          : "rgba(211, 47, 47, 0.5)"
                      }`,
                      borderRadius: "8px",
                      height: "auto",
                      py: 0.5,
                    }}
                    avatar={
                      <Avatar
                        sx={{
                          bgcolor: isEditingExisting
                            ? "rgba(255, 165, 0, 0.3)"
                            : "rgba(225, 116, 116, 0.3)",
                          color: isEditingExisting ? "#FF8C00" : "#b92828",
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
        )
    );
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
            justifyContent: "space-between",
          }}
        >
          {" "}
          <Button
            variant="contained"
            color="error"
            component={Link}
            to="/"
            startIcon={<Event />}
            style={{ marginRight: 30 }}
          >
            Go to Event Page
          </Button>
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
          <Button
            variant="contained"
            color="error"
            component={Link}
            to="/view-all-posters"
            startIcon={<List />}
            style={{ marginLeft: 30 }}
          >
            View All
          </Button>
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
          {/* <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <Button
              variant="contained"
              color="error"
              component={Link}
              to="/"
              startIcon={<Event />}
            >
              Go to Event Page
            </Button>
            <Button
              variant="contained"
              color="error"
              component={Link}
              to="/view-all-posters"
              startIcon={<List />}
            >
              View All
            </Button>
          </Box> */}
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
                  <MenuItem value="videovideovideo">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Videocam sx={{ mr: 1.5, color: "#D32F2F" }} />
                      <Typography>Video + Video + video</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <Box component="form" onSubmit={handleSubmit}>
                {isEditMode && isEditingExisting && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      p: 1.5,
                      bgcolor: "rgba(33, 150, 243, 0.1)",
                      borderRadius: 2,
                      border: "1px solid rgba(33, 150, 243, 0.3)",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#1976d2", fontWeight: "bold" }}
                    >
                      Editing: {media?.name || "Video"}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancelEdit}
                      sx={{
                        color: "#d32f2f",
                        borderColor: "#d32f2f",
                        "&:hover": {
                          borderColor: "#b71c1c",
                          backgroundColor: "rgba(211, 47, 47, 0.04)",
                        },
                      }}
                    >
                      Cancel Edit
                    </Button>
                  </Box>
                )}

                <TextField
                  name="name"
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AddchartIcon
                        sx={{
                          mr: 1.5,
                          fontSize: 24,
                          color: "#D32F2F",
                        }}
                      />
                      Project Name
                      <Typography
                        component="span"
                        sx={{ color: "#D32F2F", ml: 0.5 }}
                      >
                        *
                      </Typography>
                    </Box>
                  }
                  fullWidth
                  required
                  onChange={handleChange}
                  variant="outlined"
                  size="medium"
                  InputLabelProps={{
                    required: false, // Disable default asterisk
                  }}
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
                {mediaType === "videovideo" && (
                  <Box
                    sx={{
                      mb: 1,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#D32F2F",
                    }}
                  >
                    {" "}
                    <label
                      style={{
                        display: "flex",
                        textAlign: "center",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={faceSwap}
                        style={{ height: 20, width: 20, color: "#D32F2F" }}
                        onChange={(e) => setFaceSwap(e.target.checked)}
                      />
                      Enable Face Swap
                    </label>
                  </Box>
                )}
                {mediaType === "videovideo" && (
                  <Box
                    sx={{
                      mb: 1,
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#D32F2F",
                    }}
                  >
                    {" "}
                    <label
                      style={{
                        display: "flex",
                        textAlign: "center",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={mergingOption}
                        style={{ height: 20, width: 20, color: "#D32F2F" }}
                        onChange={(e) => setMergingOption(e.target.checked)}
                      />
                      Enable Merging Option
                    </label>
                  </Box>
                )}
                {mediaType === "videovideovideo" && (
                  <>
                    <TextField
                      name="clientname"
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <PersonOutline
                            sx={{
                              mr: 1.5,
                              fontSize: 24,
                              color: "#D32F2F",
                            }}
                          />
                          Client Name
                          <Typography
                            component="span"
                            sx={{ color: "#D32F2F", ml: 0.5 }}
                          >
                            *
                          </Typography>
                        </Box>
                      }
                      fullWidth
                      required
                      onChange={(e) => setClientname(e.target.value)}
                      variant="outlined"
                      size="medium"
                      InputLabelProps={{
                        required: false, // Disable default asterisk
                      }}
                      value={clientname}
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
                    <TextField
                      name="brandname"
                      label={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <TwoWheelerIcon
                            sx={{
                              mr: 1.5,
                              fontSize: 24,
                              color: "#D32F2F",
                            }}
                          />
                          Brand Name
                          <Typography
                            component="span"
                            sx={{ color: "#D32F2F", ml: 0.5 }}
                          >
                            *
                          </Typography>
                        </Box>
                      }
                      fullWidth
                      required
                      onChange={(e) => setBrandname(e.target.value)}
                      variant="outlined"
                      size="medium"
                      InputLabelProps={{
                        required: false, // Disable default asterisk
                      }}
                      value={brandname}
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
                          <Typography
                            component="span"
                            sx={{ color: "#D32F2F", ml: 0.5 }}
                          >
                            *
                          </Typography>
                        </Box>
                      }
                      type="date"
                      fullWidth
                      required
                      onChange={handleChange}
                      variant="outlined"
                      size="medium"
                      InputLabelProps={{
                        required: false, // Disable default asterisk
                      }}
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
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
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
                            <Typography
                              component="span"
                              sx={{ color: "#D32F2F", ml: 0.5 }}
                            >
                              *
                            </Typography>
                          </Box>
                        }
                        format="DD/MM/YYYY"
                        value={
                          formData.date
                            ? dayjs(formData.date, "DD/MM/YYYY")
                            : null
                        }
                        onChange={(newValue) => {
                          setFormData((prev) => ({
                            ...prev,
                           date: newValue, 
                          }));
                        }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            required: true,
                            variant: "outlined",
                            size: "medium",
                             InputLabelProps: {
        required: false,         // ✅ removes the star
      },
      FormHelperTextProps: {
        sx: { display: "none" }, // ✅ hides helper star row if any
      },
                            sx: {
                              mb: 1,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </>
                )}
                {mediaType === "videovideovideo" && (
                  <>
                    <Box
                      sx={{
                        mb: 1,
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#D32F2F",
                      }}
                    >
                      {" "}
                      <label
                        style={{
                          display: "flex",
                          textAlign: "center",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={congratsOption}
                          style={{ height: 20, width: 20, color: "#D32F2F" }}
                          onChange={(e) => setCongratsOption(e.target.checked)}
                        />
                        Enable Congratulations End Text
                      </label>
                    </Box>
                    <Box
                      sx={{
                        mb: 1,
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#D32F2F",
                      }}
                    >
                      {" "}
                      <label
                        style={{
                          display: "flex",
                          textAlign: "center",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={video1TextOption}
                          style={{ height: 20, width: 20, color: "#D32F2F" }}
                          onChange={(e) =>
                            setVideo1TextOption(e.target.checked)
                          }
                        />
                        Enable overlay text for video 1
                      </label>
                    </Box>
                    <Box
                      sx={{
                        mb: 1,
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#D32F2F",
                      }}
                    >
                      {" "}
                      <label
                        style={{
                          display: "flex",
                          textAlign: "center",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={video2TextOption}
                          style={{ height: 20, width: 20, color: "#D32F2F" }}
                          onChange={(e) =>
                            setVideo2TextOption(e.target.checked)
                          }
                        />
                        Enable overlay text for video 2
                      </label>
                    </Box>
                    <Box
                      sx={{
                        mb: 1,
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#D32F2F",
                      }}
                    >
                      {" "}
                      <label
                        style={{
                          display: "flex",
                          textAlign: "center",
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={video3TextOption}
                          style={{ height: 20, width: 20, color: "#D32F2F" }}
                          onChange={(e) =>
                            setVideo3TextOption(e.target.checked)
                          }
                        />
                        Enable overlay text for video 3
                      </label>
                    </Box>
                  </>
                )}
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
                {/* {mediaType === "videovideo" && (
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
                )} */}
                <GradientButton
                  sx={{ mb: 1 }}
                  type="submit"
                  disabled={
                    isEditMode && isEditingExisting
                      ? // Different validation for edit mode
                        uploading ||
                        !formData.name ||
                        !formData.date || !formData.date === null ||
                        (mediaType === "videovideovideo" &&
                          (!clientname || !brandname))
                      : uploading ||
                        !formData.name ||
                        !formData.date ||
                        (mediaType === "videovideo" &&
                          !faceSwap &&
                          mergingOption &&
                          (!formData.video1 ||
                            !formData.video2 ||
                            !formData.audio)) ||
                        (mediaType === "videovideo" &&
                          faceSwap &&
                          !mergingOption &&
                          (!formData.boyvideo1 ||
                            !formData.girlvideo1 ||
                            !formData.childboyvideo1 ||
                            !formData.childgirlvideo1)) ||
                        (mediaType === "videovideo" &&
                          faceSwap &&
                          mergingOption &&
                          (!formData.video2 ||
                            !formData.boyvideo1 ||
                            !formData.girlvideo1 ||
                            !formData.childboyvideo1 ||
                            !formData.childgirlvideo1 ||
                            !formData.audio)) ||
                        (mediaType === "photogif" &&
                          (!formData.photo || !formData.gif)) ||
                        (mediaType === "videophoto" &&
                          (!formData.video || !formData.photo)) ||
                        (mediaType === "videovideovideo" &&
                          (!formData.video3 ||
                            !formData.video1 ||
                            !formData.video2))
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
                      {isEditMode && isEditingExisting
                        ? "Updating..."
                        : "Creating Magic..."}
                    </>
                  ) : isEditMode && isEditingExisting ? (
                    `Update ${mediaType
                      .replace("video", "Video")
                      .replace("gif", "GIF")
                      .replace("photo", "Photo")}`
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
          {!(mediaType === "videovideo") && (
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
                  {/* <Button
                  variant="contained"
                  color="error"
                  component={Link}
                  to="/view-all-posters"
                  startIcon={<List />}
                >
                  View All
                </Button> */}
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

                  {(media?.posterVideoId || media?.mergedVideoId) &&
                    !uploading &&
                    media && (
                      <Fade in={true} timeout={500}>
                        <StyledCard>
                          <Box sx={{ position: "relative" }}>
                            <Box
                              sx={{
                                position: "relative",
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              <video
                                controls
                                style={{
                                  width: "100%",
                                  height: 700,
                                  objectFit: "contain",
                                  backgroundColor: "#a91111ff",
                                }}
                              >
                                <source
                                  src={
                                    mediaType === "videophoto" ||
                                    mediaType === "videovideovideo"
                                      ? `https://api.bilimbebrandactivations.com/api/upload/file/${media?.mergedVideoId}`
                                      : `https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}`
                                  }
                                  type="video/mp4"
                                />
                                Your browser does not support the video tag.
                              </video>
                            </Box>
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
                                    gap: "10px",
                                  }}
                                >
                                  <Button
                                    variant="outlined"
                                    onClick={handleEditClick}
                                    sx={{
                                      borderColor: "#ae1515ff",
                                      color: "#ae1515ff",
                                      borderRadius: "8px",
                                      py: 1.5,
                                      fontWeight: 600,
                                      flex: 1,
                                      "&:hover": {
                                        borderColor: "#ae1515ff",
                                        backgroundColor:
                                          "rgba(33, 150, 243, 0.04)",
                                      },
                                    }}
                                    startIcon={<Edit />}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    onClick={() => {
                                      setApproved(true);
                                      handleApproveVideo();
                                    }}
                                    sx={{
                                      borderColor: "#ae1515ff",
                                      color: "#ae1515ff",
                                      borderRadius: "8px",
                                      py: 1.5,
                                      fontWeight: 600,
                                      flex: 1,
                                      "&:hover": {
                                        borderColor: "#ae1515ff",
                                        backgroundColor:
                                          "rgba(33, 150, 243, 0.04)",
                                      },
                                    }}
                                    startIcon={<CheckCircle />}
                                  >
                                    Approve
                                  </Button>
                                </Box>
                                {media?.approved === true && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-evenly",
                                      marginTop: "10px",
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
                                )}
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
                                    <img
                                      src={media?.qrCode}
                                      alt="Download QR Code"
                                    />
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
          )}
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
                {loading ? "Sending..." : "Share"}
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
