// ===================================
// API Service with Token Refresh & Queueing
// ===================================
import { API_URL } from "@/config/env";
import { useAuthStore } from "@/store/auth.store";
import axios, {
   AxiosError,
   AxiosInstance,
   AxiosResponse,
   InternalAxiosRequestConfig,
} from "axios";

// --- TYPES ---

type FailedRequest = {
   resolve: (token?: string) => void;
   reject: (error: AxiosError) => void;
};

interface RetriedAxiosRequestConfig extends InternalAxiosRequestConfig {
   _retry?: boolean;
}

// --- CONFIGURATION ---

const API: AxiosInstance = axios.create({
   baseURL: API_URL,
   timeout: 15000,
   headers: {
      "Content-Type": "application/json",
   },
});

// --- TOKEN MANAGEMENT STATE ---

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

// --- HELPERS ---

const processQueue = (
   error: AxiosError | null,
   token: string | null = null
) => {
   failedQueue.forEach((prom) => {
      if (error) {
         prom.reject(error);
      } else if (token) {
         prom.resolve(token);
      } else {
         prom.reject(new AxiosError("Token refresh failed unexpectedly."));
      }
   });
   failedQueue = [];
};

const logoutAndRedirect = () => {
   useAuthStore.getState().logout(); // clears token, refreshToken, user
   console.warn(
      "Unauthorized access or token refresh failed. Redirecting to login."
   );
};

// --- WAIT FOR STORE REHYDRATION ---
const waitForRehydration = async () => {
   return new Promise<void>((resolve) => {
      const check = () => {
         if (useAuthStore.getState().isRehydrated) {
            resolve();
         } else {
            setTimeout(check, 10);
         }
      };
      check();
   });
};

// ===================================
// INTERCEPTORS
// ===================================

// Request Interceptor: Attach Token
API.interceptors.request.use(
   async (config: InternalAxiosRequestConfig) => {
      await waitForRehydration(); // ✅ wait until store is ready
      const token = useAuthStore.getState().token;
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh
API.interceptors.response.use(
   (response: AxiosResponse) => response,
   async (error: AxiosError) => {
      const { response, config } = error;
      const originalRequest = config as RetriedAxiosRequestConfig;

      if (response?.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;

         if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
               failedQueue.push({
                  resolve: (token) => resolve(token!),
                  reject,
               });
            }).then((token) => {
               originalRequest.headers.Authorization = `Bearer ${token}`;
               return API(originalRequest);
            });
         }

         isRefreshing = true;

         try {
            const { refreshToken, setToken, setRefreshToken } =
               useAuthStore.getState();

            const refreshResponse = await API.post("/auth/refresh", {
               refresh_token: refreshToken,
            });

            if (refreshResponse.status === 200) {
               const newToken = refreshResponse.data.access_token;
               const newRefreshToken = refreshResponse.data.refresh_token;

               setToken(newToken);
               setRefreshToken(newRefreshToken);

               processQueue(null, newToken);

               originalRequest.headers.Authorization = `Bearer ${newToken}`;
               return API(originalRequest);
            }
         } catch (refreshError) {
            processQueue(refreshError as AxiosError, null);
            logoutAndRedirect();
            return Promise.reject(refreshError);
         } finally {
            isRefreshing = false;
         }
      }

      if (response?.status === 403) {
         logoutAndRedirect();
      }

      return Promise.reject(error);
   }
);

export default API;
