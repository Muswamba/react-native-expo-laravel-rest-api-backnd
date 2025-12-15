// app/_layout.tsx

import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
   DarkTheme,
   DefaultTheme,
   ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
   router,
   Stack,
   useNavigationContainerRef,
   useSegments,
} from "expo-router"; // ⭐️ Imported useSegments
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import { useAuthStore } from "@/store/auth.store";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
   const [loaded, error] = useFonts({
      SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
      ...FontAwesome.font,
   });

   // Expo Router uses Error Boundaries to catch errors in the navigation tree.
   useEffect(() => {
      if (error) throw error;
   }, [error]);

   // Tell the splash screen to hide as soon as the fonts are loaded
   useEffect(() => {
      if (loaded) {
         SplashScreen.hideAsync();
      }
   }, [loaded]);

   if (!loaded) return null;

   return <RootLayoutNav />;
}

// ----------------------------------------------------------------------

const AuthLayoutGroup = "/(auth)";
const TabsLayoutGroup = "/(tabs)";

function RootLayoutNav() {
   const colorScheme = useColorScheme();

   // ⭐️ Deriving authentication status from the store
   const token = useAuthStore((s) => s.token);
   const isAuthenticated = token !== null;

   // ⭐️ useSegments is crucial for checking the current route location
   const segments = useSegments();
   const navigationRef = useNavigationContainerRef();
   const [isNavigationReady, setIsNavigationReady] = useState(false);

   // Wait until navigation is fully ready
   useEffect(() => {
      const unsubscribe = navigationRef.addListener("state", () => {
         if (!isNavigationReady) setIsNavigationReady(true);
      });
      return unsubscribe;
   }, [isNavigationReady]);

   // ⭐️ AUTHENTICATION GATE LOGIC
   useEffect(() => {
      if (!isNavigationReady) return;

      const inAuthGroup = segments[0] === "(auth)"; // Check if the current route is within the auth group

      if (!isAuthenticated && !inAuthGroup) {
         // User is NOT authenticated AND is trying to access a protected route (not in auth group)
         router.replace(`${AuthLayoutGroup}/login`);
      } else if (isAuthenticated && inAuthGroup) {
         // User IS authenticated AND is trying to access an auth screen (login/register)

         // Use replace to prevent going back to login screen
         router.replace(TabsLayoutGroup);
      }
   }, [isAuthenticated, segments, isNavigationReady]); // Re-run the effect when isAuthenticated or segments change

   return (
      <GestureHandlerRootView style={{ flex: 1 }}>
         <SafeAreaProvider>
            <PaperProvider>
               <ThemeProvider
                  value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                  <Stack screenOptions={{ headerShown: false }}>
                     {/* The auth screens */}
                     <Stack.Screen name="(auth)/login" />
                     <Stack.Screen name="(auth)/register" />
                     <Stack.Screen name="(auth)/forgot" />

                     {/* The (tabs) group will contain the authenticated app screens */}
                     <Stack.Screen name="(tabs)" />

                     {/* Modal screens (often used for non-critical flows) */}
                     <Stack.Screen
                        name="modal"
                        options={{ presentation: "modal" }}
                     />
                  </Stack>
               </ThemeProvider>
            </PaperProvider>
         </SafeAreaProvider>
      </GestureHandlerRootView>
   );
}
