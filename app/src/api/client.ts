import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { getStoreForApi } from "../store/storeRef";

function getApiUrl(): string {
  if (!__DEV__) {
    return "https://api.yourapp.com/api";
  }

  // Web running behind the local Cloudflare tunnel (e.g. app-local.tryclareo.com).
  // Use the matching api-local.tryclareo.com tunnel rather than localhost so
  // the request stays on HTTPS and the cookie/CORS setup matches production.
  // Single-level subdomains are used so they're covered by Cloudflare's free
  // Universal SSL on *.tryclareo.com (deep subdomains aren't).
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".tryclareo.com") || host === "tryclareo.com") {
      return "https://api-local.tryclareo.com/api";
    }
    // Plain web dev (localhost:8081) → talk to local backend directly.
    return "http://localhost:3000/api";
  }

  // Native: get the local IP from Expo's debugger host (works in Expo Go).
  const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];

  if (debuggerHost) {
    return `http://${debuggerHost}:3000/api`;
  }

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
