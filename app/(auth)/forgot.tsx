import { AuthLayout } from "@/components/auth/AuthLayout";
import { CustomInput } from "@/components/common/CustomInput";
import * as AuthService from "@/services/auth"; // Import the actual service functions
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
   ActivityIndicator,
   Alert,
   Button,
   KeyboardAvoidingView,
   Platform,
   StyleSheet,
   Text,
   TouchableOpacity,
   View,
} from "react-native";

// --- Constants for better readability/maintainability ---
const CODE_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;
const PRIMARY_COLOR = "#0095f6"; // Instagram-like blue
type Steps = 1 | 2 | 3;

export default function ForgotPassword() {
   const { colors } = useTheme(); // Note: useTheme provides theme colors

   // State to manage the flow: 1 (Email), 2 (Code), 3 (Password)
   const [step, setStep] = useState<Steps>(1);

   const [email, setEmail] = useState("");
   const [code, setCode] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

   const [error, setError] = useState<string | null>(null);
   const [isProgress, setIsProgress] = useState(false);

   // Helper function for consistent API error handling
   const getErrorMessage = (e: unknown, defaultMessage: string): string => {
      // Safely check if 'e' is an object and has 'response.data.message'
      if (
         typeof e === "object" &&
         e !== null &&
         "response" in e &&
         e.response &&
         typeof e.response === "object" &&
         "data" in e.response &&
         e.response.data &&
         typeof e.response.data === "object" &&
         "message" in e.response.data &&
         typeof e.response.data.message === "string"
      ) {
         return e.response.data.message;
      }
      // Safely check if 'e' is an Error object
      if (e instanceof Error) {
         return e.message;
      }
      return defaultMessage;
   };

   // --------------------------------------------------
   // Step 1: Request Code Handler (POST /forgot-password)
   // --------------------------------------------------
   const handleSendCode = async () => {
      setError(null);
      if (!email || !email.includes("@")) {
         setError("Please enter a valid email address.");
         return;
      }

      setIsProgress(true);
      try {
         const res = await AuthService.forgotPassword(email);
         if (res.message_code) {
            Alert.alert(
               "Code Sent",
               "A reset code has been sent to your email. Check your spam folder."
            );
            setStep(2); // Move to the validation step
         } else {
            const errorMessage = getErrorMessage(
               e,
               "Failed to send reset code. Please check your email."
            );
            setError(errorMessage);
         }
      } catch (e: unknown) {
         // Use 'unknown' for safer error handling
         const errorMessage = getErrorMessage(
            e,
            "Failed to send reset code. Please check your email."
         );
         setError(errorMessage);
      } finally {
         setIsProgress(false);
      }
   };

   // --------------------------------------------------
   // Step 2: Validate Code Handler (POST /validate-code)
   // --------------------------------------------------
   const handleValidateCode = async () => {
      setError(null);
      if (code.length !== CODE_LENGTH) {
         setError(`Please enter the ${CODE_LENGTH}-digit code.`);
         return;
      }

      setIsProgress(true);
      try {
         const res = await AuthService.validateVerificationCode(email, code);

         if (res) {
            Alert.alert(
               "Code Verified",
               "Code successfully verified. You can now set your new password."
            );
            setStep(3); // Move to the password reset step
         } else {
            const errorMessage = getErrorMessage(
               e,
               "The code is invalid or has expired."
            );
            setError(errorMessage);
         }
      } catch (e: unknown) {
         const errorMessage = getErrorMessage(
            e,
            "The code is invalid or has expired."
         );
         setError(errorMessage);
      } finally {
         setIsProgress(false);
      }
   };

   // --------------------------------------------------
   // Step 3: Reset Password Handler (POST /reset-password)
   // --------------------------------------------------
   const handleResetPassword = async () => {
      setError(null);
      if (password.length < MIN_PASSWORD_LENGTH) {
         setError(
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
         );
         return;
      }
      if (password !== confirmPassword) {
         setError("Passwords do not match.");
         return;
      }

      setIsProgress(true);
      try {
         // Note: Assuming AuthService.resetPassword handles the redundant confirmPassword safely,
         // but best practice is often to send only what the API needs (email, code, password).
         // Keeping it as is to match the current successful logic.
         const res = await AuthService.resetPassword(
            email,
            code,
            password,
            confirmPassword
         );

         if (res) {
            Alert.alert(
               "Success",
               "Your password has been successfully reset. Please log in."
            );
            router.replace("/(auth)/login"); // Redirect to login
         } else {
            // error
            const errorMessage = getErrorMessage(
               e,
               "Something went wrong while reseting your password, please again!"
            );
            setError(errorMessage);
         }
      } catch (e: unknown) {
         const errorMessage = getErrorMessage(
            e,
            "Reset failed. Please check the code and try again."
         );
         setError(errorMessage);
      } finally {
         setIsProgress(false);
      }
   };

   // --------------------------------------------------
   // UI Rendering Logic based on Step
   // --------------------------------------------------
   const renderCurrentStep = () => {
      const isButtonDisabled = isProgress; // Simplify base disabled state

      switch (step) {
         case 1:
            return (
               <>
                  <Text
                     style={[styles.stepText, { color: colors.text + "B0" }]}>
                     Step 1: Enter your registered email address.
                  </Text>
                  <CustomInput
                     placeholder="Email Address"
                     value={email}
                     onChangeText={setEmail}
                     keyboardType="email-address"
                     autoCapitalize="none"
                     disabled={isProgress}
                  />
                  {error && <Text style={styles.errorText}>{error}</Text>}
                  <View style={styles.buttonWrapper}>
                     <Button
                        title={
                           isProgress ? "Sending Code..." : "Send Reset Code"
                        }
                        onPress={handleSendCode}
                        // Refinement: use isButtonDisabled for cleaner logic
                        disabled={isButtonDisabled || !email}
                        color={PRIMARY_COLOR}
                     />
                  </View>
               </>
            );

         case 2:
            return (
               <>
                  <Text
                     style={[styles.stepText, { color: colors.text + "B0" }]}>
                     Step 2: Enter the ${CODE_LENGTH}-digit code sent to **
                     {email}**.
                  </Text>
                  <CustomInput
                     placeholder={`${CODE_LENGTH}-Digit Code`}
                     value={code}
                     onChangeText={setCode}
                     keyboardType="numeric"
                     maxLength={CODE_LENGTH}
                     disabled={isProgress}
                  />
                  {isProgress && (
                     <ActivityIndicator
                        size="small"
                        color={PRIMARY_COLOR}
                        style={styles.activityIndicator} // Use dedicated style
                     />
                  )}
                  {error && <Text style={styles.errorText}>{error}</Text>}
                  <View style={styles.buttonWrapper}>
                     <Button
                        title={isProgress ? "Verifying..." : "Verify Code"}
                        onPress={handleValidateCode}
                        // Refinement: use isButtonDisabled for cleaner logic
                        disabled={
                           isButtonDisabled || code.length !== CODE_LENGTH
                        }
                        color={PRIMARY_COLOR}
                     />
                  </View>
                  <TouchableOpacity
                     style={styles.backLink}
                     onPress={() => setStep(1)} // Removed redundant !isProgress check
                     disabled={isProgress}
                     activeOpacity={0.7}>
                     <Text
                        style={[
                           styles.linkText,
                           { color: colors.text + "CC" },
                        ]}>
                        &lt; Go back to change email
                     </Text>
                  </TouchableOpacity>
               </>
            );

         case 3:
            return (
               <>
                  <Text
                     style={[styles.stepText, { color: colors.text + "B0" }]}>
                     Step 3: Set your new password.
                  </Text>
                  <CustomInput
                     placeholder={`New Password (min ${MIN_PASSWORD_LENGTH} characters)`}
                     value={password}
                     onChangeText={setPassword}
                     secureTextEntry={true}
                     disabled={isProgress}
                  />
                  <CustomInput
                     placeholder="Confirm New Password"
                     value={confirmPassword}
                     onChangeText={setConfirmPassword}
                     secureTextEntry={true}
                     disabled={isProgress}
                  />
                  {error && <Text style={styles.errorText}>{error}</Text>}
                  <View style={styles.buttonWrapper}>
                     <Button
                        title={isProgress ? "Resetting..." : "Reset Password"}
                        onPress={handleResetPassword}
                        color={PRIMARY_COLOR}
                        disabled={
                           isButtonDisabled || // Use isButtonDisabled
                           password.length < MIN_PASSWORD_LENGTH ||
                           password !== confirmPassword
                        }
                     />
                  </View>
               </>
            );
      }
   };

   // --------------------------------------------------
   // Main Render
   // --------------------------------------------------
   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === "ios" ? "padding" : "height"}>
         <AuthLayout
            title="Forgot Password"
            subtitle={`Password Reset - Step ${step} of 3`}>
            <View style={styles.formContainer}>{renderCurrentStep()}</View>

            {/* Go back to login link */}
            <View
               style={[
                  styles.loginContainer,
                  { borderTopColor: colors.border },
               ]}>
               <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => router.push("/(auth)/login")}>
                  <Text style={[styles.linkText, { color: PRIMARY_COLOR }]}>
                     Back to Log in
                  </Text>
               </TouchableOpacity>
            </View>
         </AuthLayout>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   container: { flex: 1 }, // Added for KeyboardAvoidingView
   formContainer: { flexGrow: 1, alignItems: "stretch", paddingTop: 10 },
   stepText: {
      fontSize: 14,
      marginBottom: 15,
      textAlign: "center",
      paddingHorizontal: 20,
   },
   buttonWrapper: { marginTop: 24 },
   errorText: {
      color: "red",
      textAlign: "center",
      marginTop: 10,
      fontSize: 13,
   },
   // New style for indicator for cleaner code
   activityIndicator: { marginVertical: 10 },
   backLink: { marginTop: 15, alignItems: "center" },
   loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 15,
      borderTopWidth: 1,
   },
   linkText: { color: PRIMARY_COLOR, fontWeight: "600" }, // Use PRIMARY_COLOR constant
});
