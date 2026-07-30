import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerTitleAlign: "center",
                tabBarActiveTintColor: "#111827",
                tabBarInactiveTintColor: "#6B7280",
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