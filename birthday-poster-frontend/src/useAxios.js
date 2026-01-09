import { useMemo } from 'react';
import axios from "axios";

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
          // Only alert if we aren't already on the login page to avoid loops or redundant alerts
          if (!window.location.pathname.includes('/admin/login')) {
            alert('you are logged out kindly login and contiue browsing');
            localStorage.clear();
            window.location.href = '/admin/login';
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