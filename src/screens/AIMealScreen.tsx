import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { analyzeMeal } from "@/lib/gemini";
import { logMeal, saveMealAsTemplate } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { colors, spacing, borderRadius, fontSize } from "@/constants/theme";

export default function AIMealScreen({ navigation }: any) {
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [mealData, setMealData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleAnalyze = async () => {
    if (!description.trim()) {
      Alert.alert("Error", "Please describe your meal");
      return;
    }

    setAnalyzing(true);
    try {
      const result = await analyzeMeal(description);
      setMealData(result);
      setAnalyzed(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to analyze meal");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !mealData) return;

    setSaving(true);
    try {
      const formattedDate = date.toISOString().split("T")[0];
      await logMeal({
        userId: user.$id,
        date: formattedDate,
        mealName: mealData.mealName,
        calories: mealData.calories,
        protein: mealData.protein,
        fats: mealData.fats,
        carbs: mealData.carbs,
        isAIcalculated: true,
      });

      if (saveAsTemplate) {
        await saveMealAsTemplate(user.$id, {
          mealName: mealData.mealName,
          calories: mealData.calories,
          protein: mealData.protein,
          fats: mealData.fats,
          carbs: mealData.carbs,
          isAIcalculated: true,
        });
        setSaveAsTemplate(false);
      }

      Alert.alert("Success", "Meal logged successfully!", [
        {
          text: "OK",
          onPress: () => {
            setDescription("");
            setMealData(null);
            setAnalyzed(false);
            navigation.navigate("Today");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save meal");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setDescription("");
    setMealData(null);
    setAnalyzed(false);
    setDate(new Date());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.title}>🤖 AI Meal Analysis</Text>
          <Text style={styles.subtitle}>
            Describe your meal and let AI calculate the nutrients
          </Text>

          {!analyzed ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                {Platform.OS === "ios" ? (
                  <View style={styles.datePickerContainerIOS}>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                      maximumDate={new Date()}
                      themeVariant="dark"
                    />
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={{ color: colors.text }}>
                        {date.toLocaleDateString()}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meal Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., A bowl of oatmeal with banana, blueberries, and a glass of milk"
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.purpleButton,
                  analyzing && styles.buttonDisabled,
                ]}
                onPress={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.buttonText}>🤖 Analyze with AI</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>{mealData.mealName}</Text>
                <View style={styles.nutrientsGrid}>
                  <View style={styles.nutrientBox}>
                    <Text style={styles.nutrientLabel}>Calories</Text>
                    <Text
                      style={[styles.nutrientValue, { color: colors.info }]}
                    >
                      {mealData.calories}
                    </Text>
                    <Text style={styles.nutrientUnit}>kcal</Text>
                  </View>
                  <View style={styles.nutrientBox}>
                    <Text style={styles.nutrientLabel}>Protein</Text>
                    <Text
                      style={[styles.nutrientValue, { color: colors.success }]}
                    >
                      {mealData.protein}
                    </Text>
                    <Text style={styles.nutrientUnit}>g</Text>
                  </View>
                  <View style={styles.nutrientBox}>
                    <Text style={styles.nutrientLabel}>Fats</Text>
                    <Text
                      style={[styles.nutrientValue, { color: colors.warning }]}
                    >
                      {mealData.fats}
                    </Text>
                    <Text style={styles.nutrientUnit}>g</Text>
                  </View>
                  <View style={styles.nutrientBox}>
                    <Text style={styles.nutrientLabel}>Carbs</Text>
                    <Text
                      style={[styles.nutrientValue, { color: colors.orange }]}
                    >
                      {mealData.carbs}
                    </Text>
                    <Text style={styles.nutrientUnit}>g</Text>
                  </View>
                </View>
              </View>

              <View style={styles.switchContainer}>
                <Switch
                  value={saveAsTemplate}
                  onValueChange={setSaveAsTemplate}
                  trackColor={{ false: colors.border, true: colors.success }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : (saveAsTemplate ? '#FFFFFF' : '#f4f3f4')}
                />
                <Text style={styles.switchLabel}>Save this meal for future use</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    { flex: 1, marginRight: spacing.sm },
                  ]}
                  onPress={handleReset}
                >
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.successButton,
                    { flex: 1, marginLeft: spacing.sm },
                    saving && styles.buttonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {saving ? "Saving..." : "Save Meal"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    justifyContent: "center",
  },
  datePickerContainerIOS: {
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: "flex-start",
  },
  textArea: {
    minHeight: 100,
  },
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  purpleButton: {
    backgroundColor: colors.purple,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  secondaryButton: {
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: colors.cardLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  resultTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  nutrientsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nutrientBox: {
    alignItems: "center",
  },
  nutrientLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  nutrientValue: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },
  nutrientUnit: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  switchLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
});
