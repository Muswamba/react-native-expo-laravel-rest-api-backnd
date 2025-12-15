import { StyleSheet } from "react-native";

import UserTemplateBody from "@/components/user/UserTemplateBody";
import { useAuthStore } from "@/store/auth.store";

export default function ProfileScreen() {
   const user = useAuthStore((state) => state.user || null);
   return <UserTemplateBody user={user} />;
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
   },
   title: {
      fontSize: 20,
      fontWeight: "bold",
   },
   separator: {
      marginVertical: 30,
      height: 1,
      width: "80%",
   },
});
