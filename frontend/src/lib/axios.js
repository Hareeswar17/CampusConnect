import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
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
