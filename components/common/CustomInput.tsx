// =====================================
// CustomInput
// =====================================
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { FC } from "react";
import {
   StyleProp,
   StyleSheet,
   Text,
   TextInput,
   TextInputProps, // Import TextInputProps for better type safety
   TouchableOpacity,
   View,
   ViewStyle,
} from "react-native";

// --- TYPES ---
// Extend TextInputProps to inherit all standard TextInput properties
interface CustomInputProps extends Omit<TextInputProps, "style"> {
   label?: string;
   error?: string;
   containerStyle?: StyleProp<ViewStyle>;
   showToggle?: boolean; // Controls if the eye icon is visible (for password fields)
   toggleFunction?: () => void; // Function to handle toggling visibility
   isPassword?: boolean; // Current visibility state (secureTextEntry equivalent)
   // 'value' is required by TextInputProps, so it's inherited.
}

// --- CONSTANTS ---
const ERROR_COLOR = "#ff3b30";
const PADDING_FOR_TOGGLE = 48; // Padding to prevent text from going under the eye icon

// --- COMPONENT ---

/**
 * A custom themed TextInput component with integrated error display and password toggle functionality.
 */
export const CustomInput: FC<CustomInputProps> = ({
   label,
   error,
   containerStyle,
   disabled = false, // Set a default value for disabled
   showToggle,
   toggleFunction,
   isPassword,
   // Props that should go directly to TextInput are implicitly captured by '...rest'
   ...rest
}) => {
   const hasError = !!error;
   const { colors, dark } = useTheme();

   // Combine and calculate dynamic styles once
   const inputDynamicStyles: StyleProp<ViewStyle> = [
      styles.input,
      {
         color: colors.text,
         backgroundColor: colors.card,
         borderColor: hasError ? ERROR_COLOR : colors.border,
         // Calculate the shadow color based on error state and theme
         shadowColor: hasError
            ? ERROR_COLOR
            : dark
            ? "#000" // Dark theme shadow
            : "#00000040", // Light theme shadow
      },
      // Conditional styles
      disabled && styles.disabledInput,
      showToggle && { paddingRight: PADDING_FOR_TOGGLE },
   ];

   return (
      <View style={[styles.container, containerStyle]}>
         {/* Label */}
         {label && (
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
         )}

         {/* Input Field and Toggle Button Container */}
         <View style={styles.inputContainer}>
            <TextInput
               // Apply pre-calculated styles
               style={inputDynamicStyles}
               placeholderTextColor={colors.text + "66"}
               editable={!disabled}
               // The 'isPassword' prop determines the secureTextEntry value
               secureTextEntry={isPassword}
               // Spread remaining props (value, onChangeText, onBlur, keyboardType, etc.)
               {...rest}
            />

            {/* Toggle Button for Password visibility */}
            {showToggle && toggleFunction && (
               <TouchableOpacity
                  onPress={toggleFunction}
                  style={styles.toggleButton}
                  disabled={disabled} // Correct placement of the disabled prop
                  activeOpacity={0.7}>
                  <Ionicons
                     // Use the state of isPassword to determine the icon
                     name={isPassword ? "eye-off" : "eye"}
                     size={20}
                     color={colors.text + "CC"}
                  />
               </TouchableOpacity>
            )}
         </View>

         {/* Error Message */}
         {hasError && <Text style={styles.errorText}>{error}</Text>}
      </View>
   );
};

// ====================================
// Styles
// ====================================
const styles = StyleSheet.create({
   container: {
      width: "100%",
      marginBottom: 18,
   },
   label: {
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 0.3,
      marginBottom: 6, // Added spacing between label and input
   },
   inputContainer: {
      // This container holds the TextInput and the absolute-positioned toggle button
      position: "relative",
   },
   input: {
      height: 52,
      borderRadius: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      fontSize: 16,
      fontWeight: "400",
      shadowOpacity: 0.15,
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowRadius: 4,
   },
   disabledInput: {
      // Use a specific style object for disabled state
      opacity: 0.55,
   },
   toggleButton: {
      position: "absolute",
      // Center the button vertically within the 52px height of the input
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 12,
      right: 0,
   },
   errorText: {
      fontSize: 12,
      fontWeight: "500",
      letterSpacing: 0.3,
      color: ERROR_COLOR, // Use constant color
      marginTop: 4, // Spacing above the error message
   },
});
