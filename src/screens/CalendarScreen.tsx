import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  getAllUserMeals,
  aggregateMealsByDate,
  getUserRequirements,
} from "../lib/database";
import { useAuth } from "../contexts/AuthContext";
import { colors, spacing, borderRadius, fontSize } from "../constants/theme";
import { useFocusEffect } from "@react-navigation/native";

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDateISO = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, 1);

const monthLabel = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

export default function CalendarScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mealData, setMealData] = useState<any>({});
  const [requirements, setRequirements] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date()),
  );

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
      const today = formatDateISO(new Date());

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
    }, [user]),
  );

  const handleDayPress = (date: string) => {
    const today = formatDateISO(new Date());

    if (date > today) return; // Don't allow future dates

    setSelectedDate(date);
    setSelectedDayData(mealData[date] || null);
  };

  const renderCalendarGrid = () => {
    const todayISO = formatDateISO(new Date());
    const monthStart = startOfMonth(currentMonth);
    const daysInMonth = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0,
    ).getDate();
    const firstWeekday = monthStart.getDay(); // 0=Sun

    const cells: React.ReactElement[] = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const dateObj = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        dayNumber,
      );
      const dateISO = formatDateISO(dateObj);
      const isFuture = dateISO > todayISO;
      const isSelected = selectedDate === dateISO;
      const mark = markedDates[dateISO];
      const dotColor = mark?.dotColor;

      cells.push(
        <TouchableOpacity
          key={dateISO}
          style={[
            styles.dayCell,
            isSelected && styles.dayCellSelected,
            isFuture && styles.dayCellDisabled,
          ]}
          onPress={() => handleDayPress(dateISO)}
          disabled={isFuture}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.dayTextSelected,
              isFuture && styles.dayTextDisabled,
            ]}
          >
            {dayNumber}
          </Text>
          {!!dotColor && !isSelected && (
            <View style={[styles.dayDot, { backgroundColor: dotColor }]} />
          )}
        </TouchableOpacity>,
      );
    }

    return <View style={styles.grid}>{cells}</View>;
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
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => setCurrentMonth((m) => addMonths(m, -1))}
            activeOpacity={0.8}
          >
            <Text style={styles.monthNavText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.monthTitle}>{monthLabel(currentMonth)}</Text>

          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={() => setCurrentMonth((m) => addMonths(m, 1))}
            disabled={
              startOfMonth(addMonths(currentMonth, 1)).getTime() >
              startOfMonth(new Date()).getTime()
            }
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.monthNavText,
                startOfMonth(addMonths(currentMonth, 1)).getTime() >
                startOfMonth(new Date()).getTime()
                  ? styles.monthNavTextDisabled
                  : null,
              ]}
            >
              ›
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdays}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <Text key={d} style={styles.weekdayText}>
              {d}
            </Text>
          ))}
        </View>

        {renderCalendarGrid()}

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
                      requirements.targetCalories,
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
                      requirements.targetProtein,
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
                      requirements.targetFats,
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
                      requirements.targetCarbs,
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
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.cardLight,
  },
  monthNavText: {
    fontSize: 22,
    color: colors.text,
    marginTop: -2,
  },
  monthNavTextDisabled: {
    color: colors.textMuted,
  },
  weekdays: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  weekdayText: {
    width: "14.2857%",
    textAlign: "center",
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  dayCell: {
    width: "14.2857%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "500",
  },
  dayTextSelected: {
    color: colors.text,
    fontWeight: "700",
  },
  dayTextDisabled: {
    color: colors.textMuted,
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
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
