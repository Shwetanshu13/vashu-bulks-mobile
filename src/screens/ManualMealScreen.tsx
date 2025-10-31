import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { logMeal } from "../lib/database";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing, borderRadius, fontSize } from "../constants/theme";

export default function ManualMealScreen({ navigation }: any) {
  const { user } = useAuth();
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fats, setFats] = useState("");
  const [carbs, setCarbs] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mealName || !calories || !protein || !fats || !carbs) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await logMeal({
        userId: user.$id,
        date: today,
        mealName,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        fats: parseFloat(fats),
        carbs: parseFloat(carbs),
        isAIcalculated: false,
      });

      Alert.alert("Success", "Meal logged successfully!", [
        {
          text: "OK",
          onPress: () => {
            setMealName("");
            setCalories("");
            setProtein("");
            setFats("");
            setCarbs("");
            navigation.navigate("Today");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.title}>Log Meal Manually</Text>
          <Text style={styles.subtitle}>Enter the nutritional information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Chicken and Rice"
              placeholderTextColor={colors.textMuted}
              value={mealName}
              onChangeText={setMealName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 500"
              placeholderTextColor={colors.textMuted}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30"
              placeholderTextColor={colors.textMuted}
              value={protein}
              onChangeText={setProtein}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fats (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 15"
              placeholderTextColor={colors.textMuted}
              value={fats}
              onChangeText={setFats}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 45"
              placeholderTextColor={colors.textMuted}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging..." : "Log Meal"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
