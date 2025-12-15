// components/Logos/AppLogo.tsx

import React from "react";
import { StyleProp, ViewStyle } from "react-native"; // Import ViewStyle for the style prop
import { Avatar } from "react-native-paper";

interface AppLogoProps {
   size?: number;
   // ⭐️ Adding margin bottom to the interface
   marginBottom?: number;
}

export const AppLogo = ({ size = 100, marginBottom }: AppLogoProps) => {
   // ⭐️ Define the base style, including the optional marginBottom
   const containerStyle: StyleProp<ViewStyle> = {
      alignSelf: "center",

      marginBottom: marginBottom, // Apply the marginBottom prop here
   };

   return (
      <Avatar.Image
         // ⭐️ FIX 1: Pass the size prop directly to Avatar.Image
         size={size}
         source={require("../../assets/images/logo.png")}
         // ⭐️ FIX 2: Apply the simple container style
         style={containerStyle}
         // ⭐️ FIX 3: Remove conflicting width, height, and resizeMode from styles
      />
   );
};
