// =====================================
// AUTH LAYOUT
// =====================================
import { useTheme } from "@react-navigation/native";
import React, { FC, PropsWithChildren } from "react";
import {
   KeyboardAvoidingView,
   Platform,
   StyleSheet,
   Text,
   View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
// Assuming AppLogo is correctly defined and imported from its relative path
import { AppLogo } from "../logos/AppLogo";

// --- TYPES ---
interface AuthLayoutProps {
   /** The main title displayed on the screen (e.g., "Sign In") */
   title: string;
   /** An optional subtitle for additional context */
   subtitle?: string;
}

// --- CONSTANTS ---
const KEYBOARD_BEHAVIOR = Platform.OS === "ios" ? "padding" : "height";
const LOGO_SIZE = 80;

// --- COMPONENT ---

/**
 * A standard layout component for authentication screens (Login, Signup, Forgot Password).
 * It handles safe areas, keyboard avoiding, a header with a logo/title/subtitle,
 * and a scrollable container for the main content.
 * * @param {AuthLayoutProps} props - The props for the component.
 * @returns {JSX.Element} The AuthLayout component.
 */
export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = ({
   title,
   subtitle,
   children,
}) => {
   // Destructure colors from the theme for cleaner style usage
   const { colors } = useTheme();

   // Conditionally apply text styles using an array and spreading for conciseness
   const titleStyle = [styles.title, { color: colors.text }];
   const subtitleStyle = [styles.subtitle, { color: colors.text }];

   return (
      <KeyboardAvoidingView
         // Use constants and theme colors directly
         style={[styles.container, { backgroundColor: colors.background }]}
         behavior={KEYBOARD_BEHAVIOR}>
         <SafeAreaView style={styles.safeArea}>
            {/* Use the default ScrollView if react-native-gesture-handler's is not strictly necessary for this use case */}
            {/* Switched back to ScrollView from 'react-native' for simplicity if no specific gesture needs are met */}
            <ScrollView
               contentContainerStyle={styles.scrollContent}
               keyboardShouldPersistTaps="handled"
               showsVerticalScrollIndicator={false}>
               {/* Header Section */}
               <View style={styles.header}>
                  <AppLogo size={LOGO_SIZE} />
                  <Text style={titleStyle}>{title}</Text>
                  {/* Conditional rendering is cleaner outside the style array */}
                  {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
               </View>

               {/* Main Content (Forms/Inputs) */}
               {/* A dedicated container ensures children fill the available space */}
               <View style={styles.formContainer}>{children}</View>
            </ScrollView>
         </SafeAreaView>
      </KeyboardAvoidingView>
   );
};

// --- STYLES ---

const styles = StyleSheet.create({
   container: {
      // Fills the entire screen
      flex: 1,
   },
   safeArea: {
      flex: 1,
      // Apply horizontal padding once here for the entire screen
      paddingHorizontal: 20,
   },
   scrollContent: {
      // Ensures content can grow and push the form down/center vertically if space allows
      flexGrow: 1,
      justifyContent: "space-between",
   },
   header: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 30,
   },
   title: {
      fontSize: 28,
      fontWeight: "bold",
      marginTop: 10,
      // Color is handled by the theme prop application
   },
   subtitle: {
      fontSize: 16,
      marginBottom: 20,
   },
   formContainer: {
      flexGrow: 1,
      // Ensures inner content stretches horizontally (e.g., full-width buttons)
      alignItems: "stretch",
      paddingTop: 10,
      // Added paddingBottom to ensure content near the bottom is not obscured by the keyboard or bottom safe area (though Safe Area helps)
      paddingBottom: 20,
   },
});
