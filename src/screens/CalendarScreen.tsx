import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import {
  getAllUserMeals,
  aggregateMealsByDate,
  getUserRequirements,
} from "../lib/database";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing, borderRadius, fontSize } from "../constants/theme";
import { useFocusEffect } from "@react-navigation/native";

export default function CalendarScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mealData, setMealData] = useState<any>({});
  const [requirements, setRequirements] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  const loadData = async () => {
    if (!user) return;

    try {
      const [meals, reqs] = await Promise.all([
        getAllUserMeals(user.$id),
        getUserRequirements(user.$id),
      ]);

      const aggregated = aggregateMealsByDate(meals);
      setMealData(aggregated);
      setRequirements(reqs);

      // Create marked dates for calendar
      const marked: any = {};
      const today = new Date().toISOString().split("T")[0];

      Object.keys(aggregated).forEach((date) => {
        if (date > today) return; // Skip future dates

        const dayData = aggregated[date];
        let color = colors.cardLight;

        if (reqs) {
          const caloriesDiff = dayData.calories - reqs.targetCalories;
          const tolerance = reqs.targetCalories * 0.1;

          if (Math.abs(caloriesDiff) <= tolerance) {
            color = colors.success; // Green
          } else if (caloriesDiff > 0) {
            color = colors.info; // Blue
          } else {
            color = colors.orange; // Orange
          }
        }

        marked[date] = {
          marked: true,
          dotColor: color,
        };
      });

      setMarkedDates(marked);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const handleDayPress = (day: any) => {
    const date = day.dateString;
    const today = new Date().toISOString().split("T")[0];

    if (date > today) return; // Don't allow future dates

    setSelectedDate(date);
    setSelectedDayData(mealData[date] || null);
  };

  const calculateDifference = (actual: number, target: number) => {
    const diff = actual - target;
    const sign = diff >= 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)}`;
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
      <View style={styles.calendarCard}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: colors.primary,
            },
          }}
          maxDate={new Date().toISOString().split("T")[0]}
          theme={{
            calendarBackground: colors.card,
            textSectionTitleColor: colors.textMuted,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.text,
            todayTextColor: colors.primary,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            monthTextColor: colors.text,
            textMonthFontWeight: "600",
          }}
        />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.success }]}
            />
            <Text style={styles.legendText}>Target Met</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.info }]}
            />
            <Text style={styles.legendText}>Surplus</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: colors.orange }]}
            />
            <Text style={styles.legendText}>Deficit</Text>
          </View>
        </View>
      </View>

      {selectedDayData && requirements && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>

          <View style={styles.nutrientsList}>
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientName}>Calories:</Text>
              <View style={styles.nutrientValues}>
                <Text style={styles.nutrientCurrent}>
                  {selectedDayData.calories.toFixed(0)} kcal
                </Text>
                <Text style={styles.nutrientTarget}>
                  Target: {requirements.targetCalories}{" "}
                  <Text
                    style={
                      selectedDayData.calories >= requirements.targetCalories
                        ? styles.surplus
                        : styles.deficit
                    }
                  >
                    (
                    {calculateDifference(
                      selectedDayData.calories,
                      requirements.targetCalories
                    )}
                    )
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientName}>Protein:</Text>
              <View style={styles.nutrientValues}>
                <Text style={styles.nutrientCurrent}>
                  {selectedDayData.protein.toFixed(1)}g
                </Text>
                <Text style={styles.nutrientTarget}>
                  Target: {requirements.targetProtein}g{" "}
                  <Text
                    style={
                      selectedDayData.protein >= requirements.targetProtein
                        ? styles.surplus
                        : styles.deficit
                    }
                  >
                    (
                    {calculateDifference(
                      selectedDayData.protein,
                      requirements.targetProtein
                    )}
                    g)
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientName}>Fats:</Text>
              <View style={styles.nutrientValues}>
                <Text style={styles.nutrientCurrent}>
                  {selectedDayData.fats.toFixed(1)}g
                </Text>
                <Text style={styles.nutrientTarget}>
                  Target: {requirements.targetFats}g{" "}
                  <Text
                    style={
                      selectedDayData.fats >= requirements.targetFats
                        ? styles.surplus
                        : styles.deficit
                    }
                  >
                    (
                    {calculateDifference(
                      selectedDayData.fats,
                      requirements.targetFats
                    )}
                    g)
                  </Text>
                </Text>
              </View>
            </View>

            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientName}>Carbs:</Text>
              <View style={styles.nutrientValues}>
                <Text style={styles.nutrientCurrent}>
                  {selectedDayData.carbs.toFixed(1)}g
                </Text>
                <Text style={styles.nutrientTarget}>
                  Target: {requirements.targetCarbs}g{" "}
                  <Text
                    style={
                      selectedDayData.carbs >= requirements.targetCarbs
                        ? styles.surplus
                        : styles.deficit
                    }
                  >
                    (
                    {calculateDifference(
                      selectedDayData.carbs,
                      requirements.targetCarbs
                    )}
                    g)
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.mealsSection}>
            <Text style={styles.mealsTitle}>
              Meals ({selectedDayData.meals.length})
            </Text>
            {selectedDayData.meals.map((meal: any, index: number) => (
              <View key={meal.$id || index} style={styles.mealItem}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealName}>{meal.mealName}</Text>
                  {meal.isAIcalculated && (
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>🤖</Text>
                    </View>
                  )}
                </View>
                <View style={styles.mealNutrients}>
                  <Text style={styles.mealNutrient}>{meal.calories} kcal</Text>
                  <Text style={styles.mealNutrient}>{meal.protein}g P</Text>
                  <Text style={styles.mealNutrient}>{meal.fats}g F</Text>
                  <Text style={styles.mealNutrient}>{meal.carbs}g C</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {selectedDate && !selectedDayData && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyText}>No meals logged for this day</Text>
        </View>
      )}
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
  calendarCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  detailsCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.md,
  },
  nutrientsList: {
    marginBottom: spacing.md,
  },
  nutrientRow: {
    backgroundColor: colors.cardLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  nutrientName: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  nutrientValues: {
    marginTop: spacing.xs,
  },
  nutrientCurrent: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  nutrientTarget: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  surplus: {
    color: colors.info,
  },
  deficit: {
    color: colors.orange,
  },
  mealsSection: {
    marginTop: spacing.md,
  },
  mealsTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mealItem: {
    backgroundColor: colors.cardLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  mealName: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  aiBadge: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  aiBadgeText: {
    fontSize: fontSize.xs,
    color: colors.text,
  },
  mealNutrients: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  mealNutrient: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  emptyCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
