// ===================================
// API Service with Token Refresh & Queueing
// ===================================
import { API_URL } from "@/config/env";
import axios, {
   AxiosError,
   AxiosInstance,
   AxiosResponse,
   InternalAxiosRequestConfig,
} from "axios";
// Import SecureStorage or AsyncStorage helper specific to React Native if available
// import { getStoredToken, setStoredToken, clearStoredTokens } from './storage';

// --- TYPES ---

// Define the shape of a pending request in the queue
type FailedRequest = {
   resolve: (token?: string) => void;
   reject: (error: AxiosError) => void;
};

// Define the shape of the original request configuration with the retry flag
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

// In a real React Native app, authToken would typically be fetched from SecureStore/AsyncStorage
let authToken: string | null = null;
let isRefreshing: boolean = false;
let failedQueue: FailedRequest[] = [];

// --- EXPORTED TOKEN HANDLERS ---

/**
 * Sets the authentication token globally and in storage (if storage helper is available).
 * @param token The new JWT access token.
 */
export const setAuthToken = (token: string | null) => {
   authToken = token;
   // setStoredToken(token); // Add this for persistence in a real app
};

// --- HELPERS ---

/**
 * Processes the queue of failed requests waiting for a new token.
 * @param error The error if token refresh failed.
 * @param token The new token if refresh succeeded.
 */
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
         // Should not happen, but ensures all promises are handled
         prom.reject(new AxiosError("Token refresh failed unexpectedly."));
      }
   });
   failedQueue = [];
};

/**
 * Clears the token and redirects the user to the login screen.
 * This function should ideally handle navigation in a decoupled way (e.g., using a global event emitter or custom hook).
 */
const logoutAndRedirect = () => {
   setAuthToken(null);
   // clearStoredTokens(); // Clear all tokens from persistent storage

   // NOTE: Replace this with your actual navigation logic (e.g., router.replace('/login'))
   // Since we can't use router here, we log it.
   console.warn(
      "Unauthorized access or token refresh failed. Redirecting to login."
   );
};

// ===================================
// INTERCEPTORS
// ===================================

// ***********************************
// Request Interceptor: Attach Token
// ***********************************
API.interceptors.request.use(
   (config: InternalAxiosRequestConfig) => {
      if (authToken) {
         config.headers.Authorization = `Bearer ${authToken}`;
      }
      return config;
   },
   (error: AxiosError) => {
      return Promise.reject(error);
   }
);

// ***********************************
// Response Interceptor: Handle Token Refresh
// ***********************************
API.interceptors.response.use(
   (response: AxiosResponse) => response,
   async (error: AxiosError) => {
      const { response, config } = error;
      const originalRequest = config as RetriedAxiosRequestConfig;

      // 1. Check for Unauthorized status and ensure it hasn't been retried
      if (response?.status === 401 && !originalRequest._retry) {
         // Mark the request as retried immediately
         originalRequest._retry = true;

         // 2. If already refreshing, queue the current failed request
         if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
               failedQueue.push({
                  resolve: (token) => resolve(token!),
                  reject,
               });
            }).then((token) => {
               // Update header with new token and retry the original request
               originalRequest.headers.Authorization = `Bearer ${token}`;
               return API(originalRequest);
            });
         }

         // 3. Start the refresh process if not already running
         isRefreshing = true;

         try {
            // NOTE: Assume /auth/refresh-token endpoint exists and returns a new access_token
            const refreshResponse = await API.post("/auth/refresh-token");

            if (refreshResponse.status === 200) {
               const newToken = refreshResponse.data.access_token;
               setAuthToken(newToken);
               processQueue(null, newToken); // Resolve all pending requests

               // Update header of the current failed request and retry it
               originalRequest.headers.Authorization = `Bearer ${newToken}`;
               return API(originalRequest);
            }
         } catch (refreshError) {
            // Refresh failed (e.g., refresh token expired)
            processQueue(refreshError as AxiosError, null);
            logoutAndRedirect();
            return Promise.reject(refreshError);
         } finally {
            isRefreshing = false;
         }
      }

      // 4. Handle other critical errors (e.g., 403 Forbidden)
      if (response?.status === 403) {
         logoutAndRedirect();
      }

      // Reject all other errors
      return Promise.reject(error);
   }
);

export default API;
