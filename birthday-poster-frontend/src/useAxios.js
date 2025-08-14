import axios from "axios";

const getAxiosInstance = () => {
  const getAxios = axios.create({
//baseURL: "http://localhost:5000/api/",
 //baseURL:"https://bilimbe-bday-poster-backend.onrender.com/api/",
 baseURL:"http://api.bilimbebrandactivations.com/api/"
  });
  return getAxios;
};
const useAxios = () => {
  const useAxiosData = getAxiosInstance();
  return useAxiosData;
};

export default useAxios;