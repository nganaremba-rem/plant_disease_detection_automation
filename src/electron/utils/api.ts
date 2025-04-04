import axios from "axios";
import { apiUrl } from "../config/config.js";

export const AxiosInstance = axios.create({
  baseURL: apiUrl,
});
