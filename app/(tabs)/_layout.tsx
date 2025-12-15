import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable } from "react-native";

// Assuming these utility files exist from the template
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
   name: React.ComponentProps<typeof FontAwesome>["name"];
   color: string;
}) {
   return (
      <FontAwesome
         size={28}
         style={{ marginBottom: -3 }}
         {...props}
      />
   );
}

export default function TabLayout() {
   const colorScheme = useColorScheme();

   return (
      <Tabs
         screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            // Disable the static render of the header on web
            // to prevent a hydration error in React Navigation v6.
            headerShown: useClientOnlyValue(false, true),
         }}>
         <Tabs.Screen
            name="index"
            options={{
               title: "Home", // Changed to Home for capitalization consistency
               tabBarIcon: ({ color }) => (
                  <TabBarIcon
                     name="home"
                     color={color}
                  />
               ),
               // Placeholder for Message/Notifications icon on the right
               headerRight: () => (
                  <Link
                     href="/modal" // Placeholder link
                     asChild>
                     <Pressable>
                        {({ pressed }) => (
                           <FontAwesome
                              name="bell-o" // Changed from info-circle to a more appropriate notification icon
                              size={25}
                              color={Colors[colorScheme ?? "light"].text}
                              style={{
                                 marginRight: 15,
                                 opacity: pressed ? 0.5 : 1,
                              }}
                           />
                        )}
                     </Pressable>
                  </Link>
               ),
               // Placeholder for the App Logo / Name on the left
               headerLeft: () => (
                  <Pressable>
                     <FontAwesome
                        name="instagram" // Using Instagram icon as a placeholder logo
                        size={25}
                        color={Colors[colorScheme ?? "light"].text}
                        style={{
                           marginLeft: 15,
                        }}
                     />
                  </Pressable>
               ),
            }}
         />
         <Tabs.Screen
            // FIX: Corrected typo from 'seach' to 'search'
            name="explore"
            options={{
               title: "Explore",
               tabBarIcon: ({ color }) => (
                  <TabBarIcon
                     name="search"
                     color={color}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="create"
            options={{
               title: "Create",
               tabBarIcon: ({ color }) => (
                  <TabBarIcon
                     name="plus-square-o" // Changed to plus-square-o for a better Create button look
                     color={color}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="reels"
            options={{
               title: "Reels",
               tabBarIcon: ({ color }) => (
                  <TabBarIcon
                     name="play-circle-o" // Changed to play-circle-o for a dedicated video icon
                     color={color}
                  />
               ),
            }}
         />

         <Tabs.Screen
            name="profile"
            options={{
               title: "Profile",
               tabBarIcon: ({ color }) => (
                  <TabBarIcon
                     // FIX: 'person' is not a standard FontAwesome icon. Changed to 'user'.
                     name="user"
                     color={color}
                  />
               ),
            }}
         />
      </Tabs>
   );
}
