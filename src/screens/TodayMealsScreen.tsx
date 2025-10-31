import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { getMealsByDate } from "../lib/database";
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
                <Text style={styles.mealName}>{meal.mealName}</Text>
                {meal.isAIcalculated && (
                  <View style={styles.aiBadge}>
                    <Text style={styles.aiBadgeText}>🤖 AI</Text>
                  </View>
                )}
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
});
