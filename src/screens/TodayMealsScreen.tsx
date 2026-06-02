import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { getMealsByDate, updateMeal, deleteMeal } from "../lib/database";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing, borderRadius, fontSize } from "../constants/theme";
import { useFocusEffect } from "@react-navigation/native";

export default function TodayMealsScreen() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    fats: 0,
    carbs: 0,
  });
  
  const [editingMeal, setEditingMeal] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    mealName: "",
    calories: "",
    protein: "",
    fats: "",
    carbs: "",
  });

  const handleEditClick = (meal: any) => {
    setEditingMeal(meal);
    setEditFormData({
      mealName: meal.mealName,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      fats: meal.fats.toString(),
      carbs: meal.carbs.toString(),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMeal) return;
    try {
      await updateMeal(editingMeal.$id, {
        mealName: editFormData.mealName,
        calories: parseInt(editFormData.calories) || 0,
        protein: parseFloat(editFormData.protein) || 0,
        fats: parseFloat(editFormData.fats) || 0,
        carbs: parseFloat(editFormData.carbs) || 0,
        date: editingMeal.date,
      });
      setEditingMeal(null);
      loadMeals();
    } catch (error) {
      Alert.alert("Error", "Failed to update meal.");
    }
  };

  const handleDelete = (mealId: string) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMeal(mealId);
              loadMeals();
            } catch (error) {
              Alert.alert("Error", "Failed to delete meal.");
            }
          },
        },
      ]
    );
  };

  const loadMeals = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const mealsData = await getMealsByDate(user.$id, today);
      setMeals(mealsData);

      const totalsData = mealsData.reduce(
        (acc: any, meal: any) => ({
          calories: acc.calories + (meal.calories || 0),
          protein: acc.protein + (meal.protein || 0),
          fats: acc.fats + (meal.fats || 0),
          carbs: acc.carbs + (meal.carbs || 0),
        }),
        { calories: 0, protein: 0, fats: 0, carbs: 0 }
      );

      setTotals(totalsData);
    } catch (error) {
      console.error("Failed to load meals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadMeals();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Daily Totals</Text>
        <View style={styles.totalsGrid}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Calories</Text>
            <Text style={[styles.totalValue, { color: colors.info }]}>
              {totals.calories.toFixed(0)}
            </Text>
            <Text style={styles.totalUnit}>kcal</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Protein</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>
              {totals.protein.toFixed(1)}
            </Text>
            <Text style={styles.totalUnit}>g</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Fats</Text>
            <Text style={[styles.totalValue, { color: colors.warning }]}>
              {totals.fats.toFixed(1)}
            </Text>
            <Text style={styles.totalUnit}>g</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Carbs</Text>
            <Text style={[styles.totalValue, { color: colors.orange }]}>
              {totals.carbs.toFixed(1)}
            </Text>
            <Text style={styles.totalUnit}>g</Text>
          </View>
        </View>
      </View>

      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Meals ({meals.length})</Text>
        {meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>No meals logged today</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your nutrition!
            </Text>
          </View>
        ) : (
          meals.map((meal, index) => (
            <View key={meal.$id || index} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.mealName}>{meal.mealName}</Text>
                  {meal.isAIcalculated && (
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>🤖 AI</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={() => handleEditClick(meal)}>
                    <Text style={{ color: colors.info, fontSize: fontSize.sm }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(meal.$id)}>
                    <Text style={{ color: colors.error, fontSize: fontSize.sm }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.mealNutrients}>
                <View style={styles.nutrientItem}>
                  <Text style={styles.nutrientLabel}>Calories</Text>
                  <Text style={[styles.nutrientValue, { color: colors.info }]}>
                    {meal.calories}
                  </Text>
                </View>
                <View style={styles.nutrientItem}>
                  <Text style={styles.nutrientLabel}>Protein</Text>
                  <Text
                    style={[styles.nutrientValue, { color: colors.success }]}
                  >
                    {meal.protein}g
                  </Text>
                </View>
                <View style={styles.nutrientItem}>
                  <Text style={styles.nutrientLabel}>Fats</Text>
                  <Text
                    style={[styles.nutrientValue, { color: colors.warning }]}
                  >
                    {meal.fats}g
                  </Text>
                </View>
                <View style={styles.nutrientItem}>
                  <Text style={styles.nutrientLabel}>Carbs</Text>
                  <Text
                    style={[styles.nutrientValue, { color: colors.orange }]}
                  >
                    {meal.carbs}g
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={!!editingMeal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Meal</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Meal Name</Text>
              <TextInput
                style={styles.input}
                value={editFormData.mealName}
                onChangeText={(text) => setEditFormData({ ...editFormData, mealName: text })}
              />
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editFormData.calories}
                  onChangeText={(text) => setEditFormData({ ...editFormData, calories: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Protein</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editFormData.protein}
                  onChangeText={(text) => setEditFormData({ ...editFormData, protein: text })}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Fats</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editFormData.fats}
                  onChangeText={(text) => setEditFormData({ ...editFormData, fats: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Carbs</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editFormData.carbs}
                  onChangeText={(text) => setEditFormData({ ...editFormData, carbs: text })}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.cardLight }]}
                onPress={() => setEditingMeal(null)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={handleSaveEdit}
              >
                <Text style={{ color: colors.text }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  totalsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  totalItem: {
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  totalValue: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
  },
  totalUnit: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  mealsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  mealCard: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  mealName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  aiBadge: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  aiBadgeText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  mealNutrients: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutrientItem: {
    alignItems: "center",
  },
  nutrientLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.cardLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
});
