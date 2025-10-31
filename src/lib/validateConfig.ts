import {
  DATABASE_ID,
  MEALS_COLLECTION_ID,
  REQUIREMENTS_COLLECTION_ID,
} from "./appwrite";
import Constants from "expo-constants";

export interface ConfigValidation {
  isValid: boolean;
  missingFields: string[];
  errorMessage?: string;
}

/**
 * Validates that all required Appwrite configuration is present
 */
export const validateAppwriteConfig = (): ConfigValidation => {
  const missingFields: string[] = [];

  const endpoint = Constants.expoConfig?.extra?.appwriteEndpoint;
  const projectId = Constants.expoConfig?.extra?.appwriteProjectId;

  if (!endpoint) missingFields.push("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  if (!projectId) missingFields.push("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  if (!DATABASE_ID) missingFields.push("NEXT_PUBLIC_APPWRITE_DATABASE_ID");
  if (!MEALS_COLLECTION_ID)
    missingFields.push("NEXT_PUBLIC_APPWRITE_MEALS_COLLECTION_ID");
  if (!REQUIREMENTS_COLLECTION_ID)
    missingFields.push("NEXT_PUBLIC_APPWRITE_REQUIREMENTS_COLLECTION_ID");

  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      errorMessage: `Missing environment variables: ${missingFields.join(
        ", "
      )}. Please check your .env file.`,
    };
  }

  return {
    isValid: true,
    missingFields: [],
  };
};

/**
 * Logs configuration status for debugging
 */
export const logConfigStatus = () => {
  const validation = validateAppwriteConfig();

  if (!validation.isValid) {
    console.error("⚠️ Appwrite Configuration Error:");
    console.error(validation.errorMessage);
    console.error("\nMake sure your .env file contains:");
    validation.missingFields.forEach((field) => {
      console.error(`  - ${field}=<your-value>`);
    });
  } else {
    console.log("✅ Appwrite configuration is valid");
  }

  return validation;
};
