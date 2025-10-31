import { GoogleGenerativeAI } from "@google/generative-ai";
import Constants from "expo-constants";

const API_KEY = Constants.expoConfig?.extra?.geminiApiKey || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeMeal = async (mealDescription: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `Analyze this meal and provide nutritional information in JSON format. Be as accurate as possible based on typical serving sizes.

Meal: ${mealDescription}

Respond with ONLY a JSON object in this exact format (no other text):
{
  "mealName": "name of the meal",
  "calories": number,
  "protein": number (in grams),
  "fats": number (in grams),
  "carbs": number (in grams)
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const nutrition = JSON.parse(jsonMatch[0]);
    return nutrition;
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw new Error("Failed to analyze meal. Please try again.");
  }
};
