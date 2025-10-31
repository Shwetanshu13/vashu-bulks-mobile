import { Client, Account, Databases, ID, Query } from "react-native-appwrite";
import Constants from "expo-constants";

const client = new Client();

client
  .setEndpoint(Constants.expoConfig?.extra?.appwriteEndpoint || "")
  .setProject(Constants.expoConfig?.extra?.appwriteProjectId || "");

export const account = new Account(client);
export const databases = new Databases(client);

export const DATABASE_ID =
  Constants.expoConfig?.extra?.appwriteDatabaseId || "";
export const MEALS_COLLECTION_ID =
  Constants.expoConfig?.extra?.appwriteMealsCollectionId || "";
export const REQUIREMENTS_COLLECTION_ID =
  Constants.expoConfig?.extra?.appwriteRequirementsCollectionId || "";

export { ID, Query };
