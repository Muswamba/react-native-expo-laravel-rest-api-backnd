// ===============================
// AUTH STORE (ADD REFRESH TOKEN)
// ===============================
import { User } from "@/types/User";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Fallback in-memory storage
const memoryStore = new Map<string, string>();

const secureStorage = {
   getItem: async (key: string) => {
      try {
         if (typeof localStorage !== "undefined") {
            return localStorage.getItem(key) ?? null;
         }
      } catch {}
      return memoryStore.get(key) ?? null;
   },
   setItem: async (key: string, value: string) => {
      try {
         if (typeof localStorage !== "undefined") {
            return localStorage.setItem(key, value);
         }
      } catch {}
      memoryStore.set(key, value);
   },
   removeItem: async (key: string) => {
      try {
         if (typeof localStorage !== "undefined") {
            return localStorage.removeItem(key);
         }
      } catch {}
      memoryStore.delete(key);
   },
};

// ======================
// Auth state
// ======================

type AuthState = {
   token: string | null; // access token
   refreshToken: string | null; // refresh token
   user: User | null;
   isAuthenticated: boolean;
   isRehydrated: boolean;

   setToken: (token: string | null) => void; // UNCHANGED
   setRefreshToken: (token: string | null) => void; // NEW
   setUser: (user: User | null) => void;
   logout: () => void;
};

// =====================
// Create persisted store
// =====================

export const useAuthStore = create<AuthState>()(
   persist(
      (set) => ({
         token: null,
         refreshToken: null,
         user: null,
         isAuthenticated: false,
         isRehydrated: false,

         // ✅ UNCHANGED
         setToken: (token) =>
            set((state) => ({
               ...state,
               token,
               isAuthenticated: !!token && !!state.user,
            })),

         setRefreshToken: (refreshToken) =>
            set((state) => ({
               ...state,
               refreshToken,
            })),

         setUser: (user) =>
            set((state) => ({
               ...state,
               user,
               isAuthenticated: !!user && !!state.token,
            })),

         logout: () =>
            set({
               token: null,
               refreshToken: null,
               user: null,
               isAuthenticated: false,
            }),
      }),
      {
         name: "auth-storage",
         storage: createJSONStorage(() => secureStorage),
         partialize: (state) => ({
            token: state.token,
            refreshToken: state.refreshToken, // ✅ persist it
            user: state.user,
         }),
         onRehydrateStorage: () => (state, error) => {
            if (error) {
               console.log("Something went wrong rehydrating auth", error);
               useAuthStore.setState({
                  token: null,
                  refreshToken: null,
                  user: null,
                  isAuthenticated: false,
                  isRehydrated: true,
               });
            } else {
               useAuthStore.setState({
                  isRehydrated: true,
                  isAuthenticated: !!state?.token && !!state?.user,
               });
            }
         },
      }
   )
);
