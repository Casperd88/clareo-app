import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { getStoreForApi } from "../store/storeRef";

function getApiUrl(): string {
  if (!__DEV__) {
    return "https://api.yourapp.com/api";
  }
  
  // Get the local IP from Expo's debugger host (works in Expo Go)
  const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
  
  if (debuggerHost) {
    return `http://${debuggerHost}:3000/api`;
  }
  
  // Fallback for simulator/emulator
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }
  
  return "http://localhost:3000/api";
}

const API_URL = getApiUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const s = getStoreForApi();
  if (!s) return config;
  const token = (s.getState() as { auth: { token: string | null } }).auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const s = getStoreForApi();
      s?.dispatch({ type: "auth/logout" });
    }
    return Promise.reject(error);
  }
);
