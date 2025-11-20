// src/config/axiosConfig.js
import axios from "axios";
import { API_URL } from "./constants";

const axios_api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axios_api;