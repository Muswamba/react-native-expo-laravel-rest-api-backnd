import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { logout } from "@/services/auth";
import { User } from "@/types/User";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

//interface
interface UserTemplateBodyProps {
   user?: User;
}

export default function UserTemplateBody({ user }: UserTemplateBodyProps) {
   const handleLogout = async () => {
      await logout();
   };

   //   If user exist
   if (!user) {
      return (
         <SafeAreaView>
            <View style={styles.getStartedContainer}>
               <Text>
                  No user logged in. Please log in to access your profile.
               </Text>
            </View>
         </SafeAreaView>
      );
   }
   return (
      <SafeAreaView>
         <View style={styles.getStartedContainer}>
            <Text>Welcome, {user.name}!</Text>
            <View style={{ height: 30 }} />
            <Button
               title="Go to Home"
               onPress={() => {
                  router.push("/");
               }}
            />
            <View style={{ height: 30 }} />
            {/* Or Logout  */}
            <Button
               title="Logout"
               onPress={() => handleLogout()}
            />
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   getStartedContainer: {
      alignItems: "center",
      marginHorizontal: 50,
   },
   homeScreenFilename: {
      marginVertical: 7,
   },
   codeHighlightContainer: {
      borderRadius: 3,
      paddingHorizontal: 4,
   },
   getStartedText: {
      fontSize: 17,
      lineHeight: 24,
      textAlign: "center",
   },
   helpContainer: {
      marginTop: 15,
      marginHorizontal: 20,
      alignItems: "center",
   },
   helpLink: {
      paddingVertical: 15,
   },
   helpLinkText: {
      textAlign: "center",
   },
});
