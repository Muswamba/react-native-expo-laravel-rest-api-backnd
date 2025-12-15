// components/Logos/GoogleLogo.tsx
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Image } from "react-native";

interface GoogleLogoProps {
   size?: number;
}

export const GoogleLogo = ({ size = 100 }: GoogleLogoProps) => {
   const { dark } = useTheme();

   // STATIC image map — this works in React Native
   const logos = {
      // PATH FIXED: Now uses "../../assets" instead of "../assets"
      light: require("@/assets/images/Google/Android/light/logo.png"),
      dark: require("@/assets/images/Google/Android/dark/logo.png"),
   };

   return (
      <Image
         source={dark ? logos.dark : logos.light}
         style={{
            width: size,
            height: size,
            alignSelf: "center",
            resizeMode: "contain",
         }}
      />
   );
};
