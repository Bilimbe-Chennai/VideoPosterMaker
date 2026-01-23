/**
 * Utility functions for handling accessType across the application
 * Supports: photomerge, videomerge, and future access types
 */

// Define which access types are considered video types
const VIDEO_ACCESS_TYPES = ['videomerge'];

// Default access type if none is specified
const DEFAULT_ACCESS_TYPE = 'photomerge';

/**
 * Get the accessType for an item, with fallback logic
 * @param {Object} item - The media item
 * @param {Object} templateAccessTypeMap - Map of template names to accessTypes
 * @returns {string} - The accessType (defaults to 'photomerge')
 */
export const getAccessType = (item, templateAccessTypeMap = {}) => {
  const templateName = item.template_name || item.templatename || '';
  const accessType = templateAccessTypeMap[templateName] || 
                     (item.templateId ? null : (item.accessType || item._accessType || DEFAULT_ACCESS_TYPE));
  
  // If still null/undefined, return default
  return accessType || DEFAULT_ACCESS_TYPE;
};

/**
 * Check if an item is a video based on source field first, then accessType
 * @param {Object} item - The media item
 * @param {Object} templateAccessTypeMap - Map of template names to accessTypes
 * @param {Object} fallbackOptions - Optional fallback checks if source/accessType is not available
 * @returns {boolean} - True if item is a video type
 */
export const isVideoType = (item, templateAccessTypeMap = {}, fallbackOptions = {}) => {
  // Primary check: source field (most reliable indicator)
  if (item.source === 'video merge app') {
    return true;
  }
  if (item.source === 'photo merge app') {
    return false;
  }
  
  // Secondary check: accessType from template
  const accessType = getAccessType(item, templateAccessTypeMap);
  
  // Check if accessType is in video types list (future-proof)
  if (VIDEO_ACCESS_TYPES.includes(accessType)) {
    return true;
  }
  
  // Fallback logic only if source is not set and fallback is enabled
  if (fallbackOptions.enableFallback && !item.source) {
    const hasVideoId = !!(item.videoId || item.mergedVideoId);
    const nameHasVideo = (item.template_name || item.templatename || '').toLowerCase().includes('video');
    return hasVideoId || nameHasVideo;
  }
  
  return false;
};

/**
 * Check if an item is a photo based on accessType
 * @param {Object} item - The media item
 * @param {Object} templateAccessTypeMap - Map of template names to accessTypes
 * @returns {boolean} - True if item is a photo type
 */
export const isPhotoType = (item, templateAccessTypeMap = {}) => {
  return !isVideoType(item, templateAccessTypeMap, { enableFallback: false });
};

/**
 * Filter items by accessType (checks source first, then accessType)
 * @param {Array} items - Array of media items
 * @param {string} targetAccessType - The accessType to filter for ('videomerge', 'photomerge', etc.)
 * @param {Object} templateAccessTypeMap - Map of template names to accessTypes
 * @returns {Array} - Filtered items
 */
export const filterByAccessType = (items, targetAccessType, templateAccessTypeMap = {}) => {
  if (targetAccessType === 'videomerge') {
    // For videos: check source === 'video merge app' first, then accessType
    return items.filter(item => {
      if (item.source === 'video merge app') return true;
      if (item.source === 'photo merge app') return false;
      return isVideoType(item, templateAccessTypeMap, { enableFallback: false });
    });
  } else if (targetAccessType === 'photomerge') {
    // For photos: check source === 'photo merge app' first, then accessType
    return items.filter(item => {
      if (item.source === 'photo merge app') return true;
      if (item.source === 'video merge app') return false;
      return isPhotoType(item, templateAccessTypeMap);
    });
  } else {
    // For future access types, filter by exact match
    return items.filter(item => {
      const accessType = getAccessType(item, templateAccessTypeMap);
      return accessType === targetAccessType;
    });
  }
};

/**
 * Get media type label for display
 * @param {Object} item - The media item
 * @param {Object} templateAccessTypeMap - Map of template names to accessTypes
 * @returns {string} - 'Video' or 'Photo'
 */
export const getMediaTypeLabel = (item, templateAccessTypeMap = {}) => {
  return isVideoType(item, templateAccessTypeMap, { enableFallback: false }) ? 'Video' : 'Photo';
};

/**
 * Add a new video access type (for future extensibility)
 * @param {string} accessType - The new access type to add to video types
 */
export const addVideoAccessType = (accessType) => {
  if (!VIDEO_ACCESS_TYPES.includes(accessType)) {
    VIDEO_ACCESS_TYPES.push(accessType);
  }
};
