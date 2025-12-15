//============================
// Facebook logo
// ================================
import { Image } from "react-native";
interface FacebookLogoProps {
   size?: number;
}

export const FacebookLogo = ({ size = 100 }: FacebookLogoProps) => {
   return (
      <Image
         source={require("../../assets/images/Facebook/Primary/Facebook_Logo_Primary.png")}
         style={{
            width: size,
            height: size,
            alignSelf: "center",
            resizeMode: "contain",
         }}
      />
   );
};
