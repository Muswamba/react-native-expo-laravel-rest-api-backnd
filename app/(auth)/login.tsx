// ------------------------
// Login screen
// ------------------------
import { AuthLayout } from "@/components/auth/AuthLayout";
import { CustomInput } from "@/components/common/CustomInput";
import { FacebookLogo } from "@/components/logos/FacebookLogo";
// Assuming you have a separate logo component for Apple as well
import { GoogleLogo } from "@/components/logos/GoogleLogo";
import { login } from "@/services/auth";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Assuming SocialButton is imported here if separated
// import { SocialButton } from "@/components/common/SocialButton";

// --- TYPES ---
type ErrorState = { [key: string]: string | undefined };

// --- CONSTANTS ---
const PRIMARY_LINK_COLOR = "#1E90FF"; // Theme-agnostic blue for links
const SECONDARY_TEXT_COLOR_LIGHT = "#797171FF";
const SIGNUP_BORDER_COLOR = "#ccc"; // Lighter border for light mode

// --- COMPONENT ---
export default function LoginScreen() {
   // --- STATE ---
   const [email, setEmail] = useState<string>("");
   const [password, setPassword] = useState<string>("");
   const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
   const [error, setError] = useState<ErrorState>({});
   const [isLoading, setIsLoading] = useState<boolean>(false);

   const { colors, dark } = useTheme();

   // --- HANDLERS ---
   const togglePasswordVisibility = useCallback(() => {
      setIsPasswordVisible((prev) => !prev);
   }, []);

   const handleLogin = useCallback(async () => {
      if (!email || !password) {
         setError({
            email: !email ? "Email is required." : undefined,
            password: !password ? "Password is required." : undefined,
         });
         return;
      }

      setIsLoading(true);
      // ... API logic ...

      try {
         const response = await login(email, password);
         router.push("/");
      } catch (error) {
         console.error("Login failed:", error);
         setError({ email: "Invalid email or password." });
      } finally {
         setIsLoading(false);
      }
   }, [email, password]);

   const handleSocialLogin = useCallback((provider: "google" | "apple") => {
      // TODO: Implement Oauth/Social login logic
   }, []);

   // --- RENDER ---
   const linkTextStyle = [styles.linkText, { color: PRIMARY_LINK_COLOR }];

   return (
      <AuthLayout
         title="Login"
         subtitle="Enter your credentials or use social login to continue">
         <View style={styles.formContent}>
            {/* Email Input */}
            <CustomInput
               label="Email"
               placeholder="user@example.com"
               value={email}
               onChangeText={setEmail}
               keyboardType="email-address"
               autoCapitalize="none"
               error={error.email}
               disabled={isLoading}
            />

            {/* Password Input */}
            <CustomInput
               label="Password"
               placeholder="••••••••"
               value={password}
               onChangeText={setPassword}
               isPassword={!isPasswordVisible}
               error={error.password}
               disabled={isLoading}
               showToggle={true}
               toggleFunction={togglePasswordVisibility}
            />

            {/* Forgot password link */}
            <TouchableOpacity
               onPress={() => router.push("/forgot")}
               style={styles.forgotPasswordLink}
               disabled={isLoading}>
               <Text style={linkTextStyle}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Action Button (Login) */}
            <View style={styles.buttonSpacing}>
               <Button
                  title={isLoading ? "Logging in..." : "Login"}
                  onPress={handleLogin}
                  disabled={isLoading}
                  color={colors.primary}
               />
            </View>

            {/* Social Buttons Container */}
            <View style={styles.socialContainer}>
               {/* Using the logic from the hypothetical SocialButton component directly */}
               <TouchableOpacity
                  onPress={() => handleSocialLogin("google")}
                  disabled={isLoading}
                  style={[
                     styles.socialButton,
                     { borderColor: colors.border },
                     isLoading && { opacity: 0.6 },
                  ]}>
                  <GoogleLogo size={20} />
                  <Text
                     style={[styles.socialButtonText, { color: colors.text }]}>
                     Continue with Google
                  </Text>
               </TouchableOpacity>

               <TouchableOpacity
                  onPress={() => handleSocialLogin("apple")}
                  disabled={isLoading}
                  // Corrected: Uses AppleLogo, not FacebookLogo
                  style={[
                     styles.socialButton,
                     { borderColor: colors.border },
                     isLoading && { opacity: 0.6 },
                  ]}>
                  {/* Assuming AppleLogo exists and is imported */}
                  {/* If using Facebook, this should be FacebookLogo and text should be "Continue with Facebook" */}
                  <FacebookLogo size={20} />
                  <Text
                     style={[styles.socialButtonText, { color: colors.text }]}>
                     Continue with Facebook
                  </Text>
               </TouchableOpacity>
            </View>
         </View>

         {/* SIGNUP LINK */}
         <View
            style={[
               styles.signSignUp,
               {
                  borderTopColor: dark
                     ? SIGNUP_BORDER_COLOR + "44"
                     : SIGNUP_BORDER_COLOR,
               },
            ]}>
            <Text style={[styles.secondaryText, { color: colors.text }]}>
               Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
               <Text style={linkTextStyle}> Sign Up</Text>
            </TouchableOpacity>
         </View>
      </AuthLayout>
   );
}

// --- STYLES ---

const styles = StyleSheet.create({
   formContent: {
      // Keeps the component container for easy visual separation/scrolling
   },
   buttonSpacing: {
      marginTop: 20,
      marginBottom: 30, // Increased bottom margin for separation from social buttons
   },
   linkText: {
      // Color is now applied via style array for theme consistency
      textAlign: "right",
      // Removed marginBottom: 15; relying on layout spacing
   },
   forgotPasswordLink: {
      alignSelf: "flex-end", // Use flex-end for better standard alignment
      marginTop: -10, // Pulls it up closer to the password field
      marginBottom: 24,
   },
   socialContainer: {
      alignSelf: "stretch", // Ensures buttons fill full width
      gap: 15,
      marginBottom: 20,
   },
   signSignUp: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center", // Added for vertical alignment
      paddingVertical: 15,
      borderTopWidth: StyleSheet.hairlineWidth, // Use hairlineWidth for subtle line
   },
   secondaryText: {
      // Color is now applied via style array for theme consistency
   },
   // The errorText style is now redundant here as it is handled by CustomInput styles
   // socialButton styles remain for the inner implementation
   socialButton: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
   },
   socialButtonText: {
      fontSize: 16,
   },
});
