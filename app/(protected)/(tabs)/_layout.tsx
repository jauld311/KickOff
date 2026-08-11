import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarStyle: {
                    backgroundColor: "#000000",
                    borderTopColor: "#000000",
                },
                
                tabBarActiveTintColor: "#FF7900",
                tabBarInactiveTintColor: "#FFFFFF",
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
        />

            <Tabs.Screen
                name="matches"
                options={{
                    title: "Matches",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="football-outline" color={color} size={size} />
                    ),
                }}
        />

            <Tabs.Screen
                name="my-matches"
                options={{
                    title: "My Matches",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" color={color} size={size} />
                    ),
                }}
        />

            <Tabs.Screen
                name="my-groups"
                options={{
                    title: "My Groups",
                    tabBarIcon: ({ color, size}) => (
                        <Ionicons name="chatbox-ellipses-outline" color={color} size={size} />
                    ),
                }}  
        />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size}) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    ),
                }}
        />                   
        </Tabs>
    );
}