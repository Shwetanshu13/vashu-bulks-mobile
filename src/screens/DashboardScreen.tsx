import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { colors } from "../constants/theme";
import TodayMealsScreen from "./TodayMealsScreen";
import CalendarScreen from "./CalendarScreen";
import ManualMealScreen from "./ManualMealScreen";
import AIMealScreen from "./AIMealScreen";
import SettingsScreen from "./SettingsScreen";

const Tab = createBottomTabNavigator();

export default function DashboardScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerStyle: {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayMealsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
          headerTitle: "Today's Meals",
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="Log Meal"
        component={ManualMealScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>✏️</Text>,
        }}
      />
      <Tab.Screen
        name="AI Meal"
        component={AIMealScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
