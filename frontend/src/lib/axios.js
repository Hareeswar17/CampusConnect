import axios from "axios";

const normalizeBaseUrl = (value) => value.replace(/\/+$/, "");
const isDev = import.meta.env.MODE === "development";
const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const resolvedBaseUrl = envBaseUrl ? normalizeBaseUrl(envBaseUrl) : isDev ? "http://localhost:3000" : "";
const apiBaseUrl = resolvedBaseUrl ? `${resolvedBaseUrl}/api` : "/api";

export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

let tokenGetter = null;

export const setAuthTokenGetter = (getter) => {
  tokenGetter = getter;
};

axiosInstance.interceptors.request.use(async (config) => {
  let token = null;

  if (tokenGetter) {
    token = await tokenGetter();
  } else if (typeof window !== "undefined" && window.Clerk?.session) {
    token = await window.Clerk.session.getToken();
  }

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
