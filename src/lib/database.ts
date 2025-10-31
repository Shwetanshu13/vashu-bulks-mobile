import {
  databases,
  DATABASE_ID,
  MEALS_COLLECTION_ID,
  REQUIREMENTS_COLLECTION_ID,
  ID,
  Query,
} from "./appwrite";
import { Permission, Role } from "react-native-appwrite";

export interface Meal {
  $id?: string;
  userId: string;
  date: string;
  mealName: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  isAIcalculated: boolean;
}

export interface Requirements {
  $id?: string;
  userId: string;
  targetCalories: number;
  targetProtein: number;
  targetFats: number;
  targetCarbs: number;
}

export const getUserRequirements = async (userId: string) => {
  try {
    if (!DATABASE_ID || !REQUIREMENTS_COLLECTION_ID) {
      console.error("Database configuration missing. Check your .env file.");
      return null;
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      REQUIREMENTS_COLLECTION_ID,
      [Query.equal("userId", userId)]
    );
    return response.documents[0] || null;
  } catch (error: any) {
    console.error("Failed to get requirements:", error.message || error);

    // If collection doesn't exist, return null (will use default values)
    if (error.code === 404 || error.message?.includes("could not be found")) {
      console.warn("Requirements collection not found. Using default values.");
    }

    return null;
  }
};

export const saveRequirements = async (
  userId: string,
  requirements: Omit<Requirements, "$id" | "userId">
) => {
  try {
    if (!DATABASE_ID || !REQUIREMENTS_COLLECTION_ID) {
      throw new Error(
        "Database configuration missing. Check your .env file and ensure NEXT_PUBLIC_APPWRITE_REQUIREMENTS_COLLECTION_ID is set."
      );
    }

    const existing = await getUserRequirements(userId);

    if (existing) {
      const updated = await databases.updateDocument(
        DATABASE_ID,
        REQUIREMENTS_COLLECTION_ID,
        existing.$id,
        requirements
      );
      return updated;
    } else {
      const created = await databases.createDocument(
        DATABASE_ID,
        REQUIREMENTS_COLLECTION_ID,
        ID.unique(),
        { userId, ...requirements },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      return created;
    }
  } catch (error: any) {
    console.error("Failed to save requirements:", error.message || error);

    if (error.code === 404 || error.message?.includes("could not be found")) {
      throw new Error(
        "Requirements collection not found in Appwrite. Please create the collection first."
      );
    }

    throw error;
  }
};

export const logMeal = async (meal: Omit<Meal, "$id">) => {
  try {
    if (!DATABASE_ID || !MEALS_COLLECTION_ID) {
      throw new Error(
        "Database configuration missing. Check your .env file and ensure NEXT_PUBLIC_APPWRITE_MEALS_COLLECTION_ID is set."
      );
    }

    const created = await databases.createDocument(
      DATABASE_ID,
      MEALS_COLLECTION_ID,
      ID.unique(),
      meal,
      [
        Permission.read(Role.user(meal.userId)),
        Permission.update(Role.user(meal.userId)),
        Permission.delete(Role.user(meal.userId)),
      ]
    );
    return created;
  } catch (error: any) {
    console.error("Failed to log meal:", error.message || error);

    if (error.code === 404 || error.message?.includes("could not be found")) {
      throw new Error(
        "Meals collection not found in Appwrite. Please create the collection first."
      );
    }

    throw error;
  }
};

export const getMealsByDate = async (userId: string, date: string) => {
  try {
    if (!DATABASE_ID || !MEALS_COLLECTION_ID) {
      console.error("Database configuration missing. Check your .env file.");
      return [];
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      MEALS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.equal("date", date)]
    );
    return response.documents;
  } catch (error: any) {
    console.error("Failed to get meals:", error.message || error);

    if (error.code === 404 || error.message?.includes("could not be found")) {
      console.warn(
        "Meals collection not found. Please create the collection in Appwrite."
      );
    }

    return [];
  }
};

export const getAllUserMeals = async (userId: string) => {
  try {
    if (!DATABASE_ID || !MEALS_COLLECTION_ID) {
      console.error("Database configuration missing. Check your .env file.");
      return [];
    }

    const response = await databases.listDocuments(
      DATABASE_ID,
      MEALS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(1000)]
    );
    return response.documents;
  } catch (error: any) {
    console.error("Failed to get all meals:", error.message || error);

    if (error.code === 404 || error.message?.includes("could not be found")) {
      console.warn(
        "Meals collection not found. Please create the collection in Appwrite."
      );
    }

    return [];
  }
};

export const aggregateMealsByDate = (meals: any[]) => {
  const aggregated: Record<string, any> = {};

  meals.forEach((meal) => {
    const date = meal.date;
    if (!aggregated[date]) {
      aggregated[date] = {
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0,
        meals: [],
      };
    }

    aggregated[date].calories += meal.calories || 0;
    aggregated[date].protein += meal.protein || 0;
    aggregated[date].fats += meal.fats || 0;
    aggregated[date].carbs += meal.carbs || 0;
    aggregated[date].meals.push(meal);
  });

  return aggregated;
};
