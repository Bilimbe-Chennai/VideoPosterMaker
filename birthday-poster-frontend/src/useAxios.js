import { useMemo } from 'react';
import axios from "axios";
import { showGlobalAlert } from './utils/globalAlert';

const getAxiosInstance = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const getAxios = axios.create({
    baseURL: isLocal ? "http://127.0.0.1:7000/api/" : "https://api.bilimbebrandactivations.com/api/"
  });
  return getAxios;
};

const useAxios = () => {
  const axiosInstance = useMemo(() => {
    const instance = getAxiosInstance();

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Don't show alert for login endpoint - it handles its own errors
          const isLoginEndpoint = error.config?.url?.includes('/users/login') || 
                                  error.config?.url?.includes('/login');
          
          // Check if user is logged in (has user data in localStorage)
          const hasUser = localStorage.getItem('user');
          
          // Only show logout alert if:
          // 1. It's NOT a login endpoint
          // 2. We're NOT on the login page
          // 3. User was previously logged in (has user data)
          if (!isLoginEndpoint && 
              !window.location.pathname.includes('/admin/login') && 
              hasUser) {
            showGlobalAlert('You are logged out. Please login and continue browsing.', 'error');
            setTimeout(() => {
              localStorage.clear();
              window.location.href = '/admin/login';
            }, 2000); // Show alert for 2 seconds then redirect
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, []);

  return axiosInstance;
};

export default useAxios;