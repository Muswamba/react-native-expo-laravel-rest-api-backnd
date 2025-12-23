//====================================
// Auth service entry point
// services/auth/index.ts
//====================================

import API from "../../services/api/API";
import { useAuthStore } from "../../store/auth.store";
const { setUser, setToken, setRefreshToken } = useAuthStore.getState();

export const login = async (email: string, password: string) => {
   const response = await API.post("/login", { email, password });
   const { access_token, user, refresh_token } = response.data;

   if (access_token && user) {
      setUser(user);
      setToken(access_token);
      setRefreshToken(refresh_token);
   }

   return response.data;
};

// Register
export const register = async (
   name: string,
   email: string,
   password: string
) => {
   const response = await API.post("/register", { name, email, password });
   const { access_token, user, refresh_token } = response.data;

   if (access_token && user) {
      setUser(user);
      setToken(access_token);
      setRefreshToken(refresh_token);
   }

   return response.data;
};

// Logout
export const logout = async () => {
   useAuthStore.getState().logout();

   await API.post("/logout");
};

// Forgot Password
//

// Send request to get a verification code
export const forgotPassword = async (email: string) => {
   const response = await API.post("/forgot-password", { email });
   return response.data;
};

// Validate Verification Code
export const validateVerificationCode = async (email: string, code: any) => {
   const response = await API.post("/reset-password/validate-code", {
      email,
      code,
   });
   return response.data;
};

// Reset Password
export const resetPassword = async (
   email: string,
   code: any,
   newPassword: string,
   confirmPassword: string
) => {
   const response = await API.post("/reset-password", {
      email,
      code,
      password: newPassword,
      confirmed: confirmPassword,
   });
   return response.data;
};

// Login with OAuth Provider
export const oauthLogin = async (provider: string, token: string) => {
   const response = await API.post(`/oauth/${provider}`, { token });
   const { access_token, user } = response.data;
   if (access_token && user) {
      useAuthStore.getState().setToken(access_token);
      useAuthStore.getState().setUser(user);
   }
   return response.data;
};

// Login with Google
