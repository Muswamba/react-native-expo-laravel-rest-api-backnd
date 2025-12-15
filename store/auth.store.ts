// ===============================
// AUTH STORE (IMPROVED)
// ===============================
import { User } from "@/types/User";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Fallback in-memory storage
const memoryStore = new Map<string, string>();

const secureStorage: {
   getItem: (key: string) => Promise<string | null>;
   setItem: (key: string, value: string) => Promise<void>;
   removeItem: (key: string) => Promise<void>;
} = {
   getItem: async (key: string) => {
      try {
         if (typeof localStorage !== "undefined") {
            return localStorage.getItem(key) ?? null;
         }
      } catch (error) {
         return null;
      }

      return memoryStore.get(key) ?? null;
   },
   setItem: async (key: string, value: string) => {
      try {
         if (typeof localStorage !== "undefined") {
            return localStorage.setItem(key, value);
         }
      } catch (error) {
         memoryStore.set(key, value);
      }
   },
   removeItem: async (key: string) => {
      try {
         if (typeof localStorage !== "undefined") {
            return localStorage.removeItem(key);
         }
      } catch (error) {
         memoryStore.delete(key);
      }
   },
};

// ======================
// Auth state
//=====================

type AuthState = {
   token: string | null;
   user: User | null;
   isAuthenticated: boolean;
   isRehydrated: boolean;
   setToken: (token: string | null) => void;
   setUser: (user: User | null) => void;
   logout: () => void;
};

// =====================
// Create persisted store
//=====================

export const useAuthStore = create<AuthState>()(
   persist(
      (set) => ({
         token: null,
         user: null,
         isAuthenticated: false,
         isRehydrated: false,
         setToken: (token) =>
            set((state) => ({
               ...state,
               token,
               isAuthenticated: !!token && !!state.user,
            })),
         setUser: (user) =>
            set((state) => ({
               ...state,
               user,
               isAuthenticated: !!user && !!state.token,
            })),
         logout: () => set({ token: null, user: null }),
      }),
      {
         name: "auth-storage",
         storage: createJSONStorage(() => secureStorage),
         partialize: (state) => ({
            token: state.token,
            user: state.user,
         }),
         onRehydrateStorage: () => (state, error) => {
            if (error) {
               console.log("Something went wrong rehydrating the state", error);
               useAuthStore.setState({
                  token: null,
                  user: null,
                  isRehydrated: true,
                  isAuthenticated: false,
               });
            } else {
               useAuthStore.setState({
                  isRehydrated: true,
                  // Check the loaded token and user from the state argument
                  isAuthenticated: !!state?.token && !!state?.user,
               });
            }
         },
      }
   )
);
