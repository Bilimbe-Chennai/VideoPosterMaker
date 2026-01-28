/**
 * Utility functions to refresh user data when it's updated by Super Admin
 */

/**
 * Refreshes the current user's data from the API
 * @param {Function} axiosInstance - Axios instance
 * @returns {Promise<Object|null>} Updated user data or null if error
 */
export const refreshUserData = async (axiosInstance) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser._id && !currentUser.id) {
      console.warn('No user ID found in localStorage');
      return null;
    }

    const userId = currentUser._id || currentUser.id;
    const response = await axiosInstance.get(`/users/${userId}`);
    
    if (response.data?.success && response.data?.data) {
      const updatedUser = response.data.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch custom event to notify components of user update
      window.dispatchEvent(new CustomEvent('userDataRefreshed', { detail: updatedUser }));
      
      return updatedUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return null;
  }
};

/**
 * Sets up a listener for user data refresh events
 * @param {Function} axiosInstance - Axios instance
 * @param {Function} callback - Optional callback when user data is refreshed
 */
export const setupUserRefreshListener = (axiosInstance, callback) => {
  const handleUserUpdate = async (event) => {
    const updatedUserId = event.detail?.userId || event.detail?._id;
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser._id || currentUser.id;

    // Only refresh if the updated user is the current logged-in user
    if (updatedUserId && updatedUserId === currentUserId) {
      console.log('User data updated by Super Admin, refreshing...');
      const refreshedUser = await refreshUserData(axiosInstance);
      if (callback && refreshedUser) {
        callback(refreshedUser);
      }
    }
  };

  window.addEventListener('userUpdated', handleUserUpdate);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('userUpdated', handleUserUpdate);
  };
};

/**
 * Polls for user data changes periodically
 * @param {Function} axiosInstance - Axios instance
 * @param {number} intervalMs - Polling interval in milliseconds (default: 30 seconds)
 * @returns {Function} Cleanup function to stop polling
 */
export const startUserDataPolling = (axiosInstance, intervalMs = 30000) => {
  let lastUserHash = null;
  
  const getCurrentUserHash = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Create a simple hash of user data that changes when user is updated
    return JSON.stringify({
      name: user.name,
      email: user.email,
      accessType: user.accessType,
      status: user.status,
      companyName: user.companyName,
      phone: user.phone
    });
  };

  lastUserHash = getCurrentUserHash();

  const pollInterval = setInterval(async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!currentUser._id && !currentUser.id) {
        return;
      }

      const userId = currentUser._id || currentUser.id;
      const response = await axiosInstance.get(`/users/${userId}`);
      
      if (response.data?.success && response.data?.data) {
        const updatedUser = response.data.data;
        const newHash = JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
          accessType: updatedUser.accessType,
          status: updatedUser.status,
          companyName: updatedUser.companyName,
          phone: updatedUser.phone
        });

        // If user data has changed, update localStorage
        if (newHash !== lastUserHash) {
          console.log('User data changed, updating localStorage...');
          localStorage.setItem('user', JSON.stringify(updatedUser));
          window.dispatchEvent(new CustomEvent('userDataRefreshed', { detail: updatedUser }));
          lastUserHash = newHash;
        }
      }
    } catch (error) {
      // Silently handle errors (user might be logged out, etc.)
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Error polling user data:', error);
      }
    }
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(pollInterval);
  };
};
