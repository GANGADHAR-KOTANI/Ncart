// api.js
import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

const axios_api = axios.create({
  baseURL: "https://selecto-project.onrender.com",
});

// api.interceptors.request.use(async (config) => {
//   const token = await AsyncStorage.getItem("authToken");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default axios_api;