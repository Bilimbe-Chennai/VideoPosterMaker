import { useMemo } from 'react';
import axios from "axios";

const getAxiosInstance = () => {
  const getAxios = axios.create({
    //baseURL: "http://localhost:7000/api/",
    baseURL: "https://api.bilimbebrandactivations.com/api/"
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