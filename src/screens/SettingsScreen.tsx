import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getUserRequirements, saveRequirements } from "../lib/database";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing, borderRadius, fontSize } from "../constants/theme";
import { useFocusEffect } from "@react-navigation/native";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetCalories, setTargetCalories] = useState("");
  const [targetProtein, setTargetProtein] = useState("");
  const [targetFats, setTargetFats] = useState("");
  const [targetCarbs, setTargetCarbs] = useState("");

  const loadRequirements = async () => {
    if (!user) return;

    try {
      const data = await getUserRequirements(user.$id);
      if (data) {
        setTargetCalories(data.targetCalories.toString());
        setTargetProtein(data.targetProtein.toString());
        setTargetFats(data.targetFats.toString());
        setTargetCarbs(data.targetCarbs.toString());
      }
    } catch (error) {
      console.error("Failed to load requirements:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRequirements();
    }, [user])
  );

  const handleSave = async () => {
    if (!targetCalories || !targetProtein || !targetFats || !targetCarbs) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!user) return;

    setSaving(true);
    try {
      await saveRequirements(user.$id, {
        targetCalories: parseInt(targetCalories),
        targetProtein: parseFloat(targetProtein),
        targetFats: parseFloat(targetFats),
        targetCarbs: parseFloat(targetCarbs),
      });

      Alert.alert("Success", "Daily targets saved successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save targets");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: logout, style: "destructive" },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Daily Nutrient Targets</Text>
        <Text style={styles.subtitle}>
          Set your personalized nutrition goals
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Calories</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2500"
            placeholderTextColor={colors.textMuted}
            value={targetCalories}
            onChangeText={setTargetCalories}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Protein (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 150"
            placeholderTextColor={colors.textMuted}
            value={targetProtein}
            onChangeText={setTargetProtein}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Fats (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 70"
            placeholderTextColor={colors.textMuted}
            value={targetFats}
            onChangeText={setTargetFats}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Carbs (g)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 300"
            placeholderTextColor={colors.textMuted}
            value={targetCarbs}
            onChangeText={setTargetCarbs}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            saving && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Targets"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Account</Text>
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>Name:</Text>
          <Text style={styles.userValue}>{user?.name}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userLabel}>Email:</Text>
          <Text style={styles.userValue}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  card: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  userValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: "500",
  },
});
