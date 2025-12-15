// ------------------------
// Register screen
// ------------------------
import { AuthLayout } from "@/components/auth/AuthLayout";
import { CustomInput } from "@/components/common/CustomInput";
import { register } from "@/services/auth";
// Assuming you have a separate logo component for Apple as well
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Social icons are assumed to be handled externally or omitted for this basic cleanup

// --- TYPES ---
type ErrorState = { [key: string]: string | undefined };

// --- CONSTANTS ---
const PRIMARY_LINK_COLOR = "#1E90FF"; // Theme-agnostic blue for links
const SIGNUP_BORDER_COLOR = "#ccc"; // Lighter border for light mode

// --- COMPONENT ---
export default function RegisterScreen() {
   // --- STATE ---
   const [name, setName] = useState<string>("");
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

   const handleRegister = useCallback(async () => {
      // Clear previous errors
      setError({});

      // Basic validation
      if (!name || !email || !password) {
         setError({
            name: !name ? "Your name is required." : undefined,
            email: !email ? "A valid email address is required." : undefined,
            password: !password ? "Password is required." : undefined,
         });
         return;
      }

      // Additional simple checks (can be expanded with regex)
      if (password.length < 6) {
         setError((prev) => ({
            ...prev,
            password: "Password must be at least 6 characters.",
         }));
         return;
      }

      setIsLoading(true);

      try {
         const res = await register(name, email, password);
         router.push("/");
      } catch (error) {
         // Update
      } finally {
         setIsLoading(false);
      }
   }, [name, email, password]);

   // --- RENDER ---
   const linkTextStyle = [styles.linkText, { color: PRIMARY_LINK_COLOR }];

   return (
      <AuthLayout
         title="Create Account" // Correct title for a registration screen
         subtitle="Fill in your details to get started" // Correct subtitle
      >
         <View style={styles.formContent}>
            {/* Name Input */}
            <CustomInput
               label="Name"
               placeholder="John Doe"
               value={name} // FIX: Use 'name' state
               onChangeText={setName} // FIX: Use 'setName' handler
               error={error.name}
               disabled={isLoading}
               autoCapitalize="words" // Good practice for names
            />

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

            {/* Action Button (Signup) */}
            <View style={styles.buttonSpacing}>
               <Button
                  title={isLoading ? "Signing up..." : "Sign Up"}
                  onPress={handleRegister}
                  disabled={isLoading}
                  color={colors.primary}
               />
            </View>

            {/* Terms and Privacy Link (Common on Signup screens) */}
            <Text style={[styles.termsText, { color: colors.text }]}>
               By signing up, you agree to our
               <Text
                  style={linkTextStyle}
                  onPress={() => console.log("Navigate to Terms")}>
                  {" Terms of Service "}
               </Text>
               and
               <Text
                  style={linkTextStyle}
                  onPress={() => console.log("Navigate to Privacy")}>
                  {" Privacy Policy"}
               </Text>
               .
            </Text>
         </View>

         {/* LOGIN LINK (Footer) */}
         <View
            style={[
               styles.signSignUp,
               {
                  borderTopColor: dark
                     ? SIGNUP_BORDER_COLOR + "44"
                     : colors.border, // Use theme border color
               },
            ]}>
            <Text style={[styles.secondaryText, { color: colors.text }]}>
               Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
               {/* Use replace to avoid back button issues */}
               <Text style={linkTextStyle}> Sign In</Text>
               {/* Text change to Sign In */}
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
      marginBottom: 10, // Adjusted margin to be closer to terms text
   },
   termsText: {
      fontSize: 13,
      textAlign: "center",
      paddingHorizontal: 5,
      marginBottom: 20, // Space before the footer
      lineHeight: 20,
   },
   linkText: {
      // Color is now applied via style array for theme consistency
      fontWeight: "600", // Added some weight for emphasis
   },
   // Removed unused forgotPasswordLink and socialContainer styles
   // Removed unused socialButton and socialButtonText styles

   signSignUp: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 15,
      borderTopWidth: StyleSheet.hairlineWidth,
   },
   secondaryText: {
      // Color is applied via style array for theme consistency
   },
});
