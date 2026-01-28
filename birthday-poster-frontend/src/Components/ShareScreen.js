import React, { useEffect,useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ShareScreen.css";
import { Phone } from "@mui/icons-material";
import { isVideoType } from "../utils/accessTypeUtils";

const ShareScreen = () => {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mediaData, setMediaData] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [instagramLink, setInstagramLink] = useState('');
  const [instagramButtonText, setInstagramButtonText] = useState('Visit Our Instagram');
  const videoRef = useRef(null);

  // Fetch media data and determine if it's a video, and get Instagram link
  useEffect(() => {
    const fetchMediaData = async () => {
      if (!photoId) return;
      
      try {
        setLoading(true);
        // The backend endpoint now searches by _id, photoId, posterVideoId, or mergedVideoId
        const response = await axios.get(`https://api.bilimbebrandactivations.com/api/upload/media/${photoId}`);
        const data = response.data;
        setMediaData(data);
        
        // Fetch templates to get accessType mapping
        let templateAccessTypeMap = {};
        if (data.adminid) {
          try {
            const templatesResponse = await axios.get(`https://api.bilimbebrandactivations.com/api/photomerge/templates?adminid=${data.adminid}`);
            const templates = Array.isArray(templatesResponse.data) ? templatesResponse.data : [];
            templates.forEach(template => {
              if (template.templatename) {
                templateAccessTypeMap[template.templatename] = template.accessType || 'photomerge';
              }
            });
          } catch (templatesError) {
            console.error("Error fetching templates:", templatesError);
          }
        }
        
        // Determine if it's a video based on accessType
        const isVideoItem = isVideoType(data, templateAccessTypeMap, { enableFallback: false });
        setIsVideo(isVideoItem);
        
        // Set media URL based on type
        // For photos (photomerge): use photoId (primary) or posterVideoId (fallback)
        // For videos (videomerge): use mergedVideoId (primary) or posterVideoId (fallback)
        if (isVideoItem) {
          const videoId = data.mergedVideoId || data.posterVideoId;
          if (videoId) {
            const videoUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${videoId}`;
            console.log('Setting video URL:', videoUrl, 'Video ID:', videoId);
            setMediaUrl(videoUrl);
          } else {
            // Fallback: use photoId from URL if no video ID found
            console.warn('No video ID found, using photoId as fallback');
            setMediaUrl(`https://api.bilimbebrandactivations.com/api/upload/file/${photoId}`);
          }
        } else {
          // For photos: use photoId (photomerge) or posterVideoId (fallback for older data)
          const mediaId = data.photoId || data.posterVideoId || photoId;
          setMediaUrl(`https://api.bilimbebrandactivations.com/api/upload/file/${mediaId}`);
        }
        
        // Fetch Instagram link and button text from admin settings based on adminid
        if (data.adminid) {
          try {
            const settingsResponse = await axios.get(`https://api.bilimbebrandactivations.com/api/users/premium-settings?adminid=${data.adminid}`);
            if (settingsResponse.data?.success && settingsResponse.data?.settings?.general) {
              if (settingsResponse.data.settings.general.instagramLink) {
                setInstagramLink(settingsResponse.data.settings.general.instagramLink);
              }
              if (settingsResponse.data.settings.general.instagramButtonText) {
                setInstagramButtonText(settingsResponse.data.settings.general.instagramButtonText);
              }
            }
          } catch (settingsErr) {
            console.error("Error fetching Instagram settings:", settingsErr);
            // Keep default values if fetch fails
          }
        }
        
        // Set loading to false so the component can render (both images and videos)
        setLoading(false);
        
        // For videos, show loading indicator initially
        if (isVideoItem) {
          setVideoLoading(true);
          
          // Fallback: If video events don't fire, hide loading after 3 seconds
          setTimeout(() => {
            setVideoLoading(false);
          }, 3000);
        }
      } catch (err) {
        console.error("Error fetching media data:", err);
        setImageError(true);
        setLoading(false);
      }
    };
    
    fetchMediaData();
  }, [photoId]);

  // Debug: Log when mediaUrl or isVideo changes
  useEffect(() => {
    if (isVideo) {
      console.log('Video mode - mediaUrl:', mediaUrl, 'isVideo:', isVideo, 'loading:', loading, 'videoLoading:', videoLoading);
    }
  }, [mediaUrl, isVideo, loading, videoLoading]);

  // Track URL click when ShareScreen is viewed
  useEffect(() => {
    if (photoId) {
      // Track click when ShareScreen page is viewed
      const trackView = async () => {
        try {
          await axios.post("https://api.bilimbebrandactivations.com/api/upload/update-count", {
            id: photoId,
            field: "urlclickcount"
          });
        } catch (err) {
          console.error("Error tracking URL click:", err);
        }
      };
      trackView();
    }
  }, [photoId]);

  // Block browser back button
  useEffect(() => {
    const preventBackNavigation = () => {
      window.history.pushState(null, "", window.location.pathname);
    };

    // Disable back button
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", preventBackNavigation);

    return () => {
      window.removeEventListener("popstate", preventBackNavigation);
    };
  }, []);

  // Block keyboard back navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace" || (e.ctrlKey && e.key === "z")) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const shareOptions = [
    { name: "Facebook", icon: "facebook", color: "#1877F2" },
    { name: "X", icon: "twitter", color: "#000" },
    { name: "WhatsApp", icon: "whatsapp", color: "#25D366" },
    { name: "Instagram", icon: "instagram", color: "#E4405F" },
  ];

  const handleImageLoad = () => {
    setLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setImageError(true);
    Alert("Error", `Failed to load ${isVideo ? 'video' : 'image'}. Please try again.`);
  };

  const handleVideoError = () => {
    setLoading(false);
    setVideoLoading(false);
    setImageError(true);
    Alert("Error", "Failed to load video. Please try again.");
  };

  const handleVideoLoadStart = () => {
    // Only set videoLoading, don't set loading to true (that would hide the video element)
    setVideoLoading(true);
  };

  const handleVideoLoadedMetadata = () => {
    // Metadata loaded - we now know video dimensions, can show it
    setVideoLoading(false);
    setLoading(false);
  };

  const handleVideoCanPlay = () => {
    // Video can start playing - ensure it's visible
    setVideoLoading(false);
    setLoading(false);
  };

  const handleVideoCanPlayThrough = () => {
    // Video has enough data to play through - ensure it's visible
    setVideoLoading(false);
    setLoading(false);
  };

  const handleVideoLoadedData = () => {
    // First frame loaded - show the video
    setVideoLoading(false);
    setLoading(false);
  };

  const handleUpdateCount = async (field) => {
    if (!photoId) return;
    try {
      await axios.post("https://api.bilimbebrandactivations.com/api/upload/update-count", {
        id: photoId,
        field: field
      });
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
    }
  };

  const handleShare = async (platform) => {
    const shareUrl = mediaUrl || `https://api.bilimbebrandactivations.com/api/upload/file/${photoId}`;
    const text = isVideo ? "Check out my merged video!" : "Check out my merged photo!";
    const currentUrl = window.location.href;
    const platformKey = platform.toLowerCase() === "x" ? "twitter" : platform.toLowerCase();

    // Increment share count
    const fieldMap = {
      facebook: "facebooksharecount",
      twitter: "twittersharecount",
      whatsapp: "whatsappsharecount",
      instagram: "instagramsharecount"
    };
    if (fieldMap[platformKey]) {
      handleUpdateCount(fieldMap[platformKey]);
    }

    // ON MOBILE: Use Web Share API for ALL platforms to share the actual photo/video file
    if (navigator.share) {
      try {
        const response = await fetch(shareUrl);
        const blob = await response.blob();
        const fileName = isVideo ? 'video.mp4' : 'photo.jpg';
        const fileType = isVideo ? 'video/mp4' : 'image/jpeg';
        const file = new File([blob], fileName, { type: fileType });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: isVideo ? 'Merged Video' : 'Merged Photo',
            text: text,
          });
          return;
        }
      } catch (error) {
      }
    }

    // ON DESKTOP or FALLBACK: Direct app/web navigation (Sharing the link)
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${currentUrl}`)}`,
      instagram: "https://www.instagram.com/",
    };

    if (shareUrls[platformKey]) {
      window.open(shareUrls[platformKey], "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = () => {
    if (!photoId) return;
    handleUpdateCount("downloadcount");

    const downloadUrl = mediaUrl || `https://api.bilimbebrandactivations.com/api/upload/file/${photoId}`;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = isVideo ? `merged-video-${photoId}.mp4` : `merged-photo-${photoId}.jpg`;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="share-screen">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">{isVideo ? 'Loading your video...' : 'Loading your photo...'}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (imageError) {
    const isPhotoError = !isVideo;
    return (
      <div className={`share-screen error-state ${isPhotoError ? 'photo-error' : 'video-error'}`}>
        <div className="error-container">
          <div className="error-icon-wrapper">
            <div className="error-icon-pulse"></div>
            {isPhotoError ? (
              <svg className="error-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="error-icon" width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                <path d="M10 8L14 12L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <h2 className="error-title">{isPhotoError ? 'Photo Not Found' : 'Video Not Found'}</h2>
          <p className="error-message">
            {isPhotoError 
              ? "The photo you're looking for doesn't exist or has been removed."
              : "The video you're looking for doesn't exist or has been removed."
            }
          </p>
          <div className="error-dots">
            <span className="error-dot"></span>
            <span className="error-dot"></span>
            <span className="error-dot"></span>
          </div>
        </div>
      </div>
    );
  }

  // Truncate Instagram button text for better alignment (max 30 characters)
  const truncateText = (text, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const InstagramLink = () => (
    <a
      href={instagramLink}
      target="_blank"
      rel="noopener noreferrer"
      className="instagram-button"
    >
      <span className="insta-icon-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      </span>
      <span className="insta-button-text" title={instagramButtonText}>{truncateText(instagramButtonText)}</span>
    </a>
  );

  return (
    <div className="share-screen">
      <div className="share-content-wrapper">
        <div className="image-section" style={{ position: 'relative' }}>
          {isVideo ? (
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                maxHeight: '70vh',
                minHeight: videoLoading ? '400px' : 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                backgroundColor: videoLoading ? '#f5f5f5' : 'transparent',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {videoLoading && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid rgba(102, 126, 234, 0.2)',
                      borderTop: '4px solid #667eea',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  <span style={{ color: '#667eea', fontSize: '14px', fontWeight: 600 }}>Loading video...</span>
                </div>
              )}
              {mediaUrl ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  muted={false}
                  preload="auto"
                  className="merged-image"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: '12px',
                    opacity: videoLoading ? 0.6 : 1,
                    transition: 'opacity 0.3s ease',
                    display: 'block',
                    visibility: 'visible',
                    zIndex: 1
                  }}
                  onLoadStart={handleVideoLoadStart}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onLoadedData={handleVideoLoadedData}
                  onCanPlay={handleVideoCanPlay}
                  onCanPlayThrough={handleVideoCanPlayThrough}
                  onPlaying={() => {
                    setVideoLoading(false);
                  }}
                  onWaiting={() => {
                    setVideoLoading(true);
                  }}
                  onError={(e) => {
                    console.error('Video error:', e, 'URL:', mediaUrl);
                    handleVideoError();
                  }}
                />
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <p>Video URL not available</p>
                </div>
              )}
            </div>
          ) : (
            <img
              src={mediaUrl || `https://api.bilimbebrandactivations.com/api/upload/file/${photoId}`}
              alt="Merged photo"
              className="merged-image"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>

        <div className="actions-section">
          <InstagramLink />

          <h3 className="share-header-text">Share to</h3>

          <div className="social-share-section">
            <div className="social-row">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  className="social-button"
                  onClick={() => handleShare(option.name)}
                  aria-label={`Share on ${option.name}`}
                >
                  <div
                    className="social-icon"
                    style={{
                      backgroundColor: option.name === "X" ? "#000" : option.color,
                      border: 'none',
                    }}
                  >
                    <span
                      className={`icon icon-${option.icon}`}
                      style={{ color: '#FFF' }}
                    >
                      {getIconComponent(option.icon)}
                    </span>
                  </div>
                  <span className="social-name">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="download-button"
              onClick={handleDownload}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for icons
const getIconComponent = (iconName) => {
  const icons = {
    facebook: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    twitter: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    whatsapp: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.26-6.162-3.548-8.41" />
      </svg>
    ),
    instagram: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  };

  return icons[iconName] || <span>{iconName.charAt(0).toUpperCase()}</span>;
};

// Alert utility function
const Alert = (title, message) => {
  alert(`${title}: ${message}`);
};

export default ShareScreen;
