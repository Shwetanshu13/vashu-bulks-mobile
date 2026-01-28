require('dotenv').config();

export default {
    expo: {
        name: 'Vashu Bulks',
        slug: 'vashu-bulks-mobile',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'dark',
        newArchEnabled: true,
        splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#111827',
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.vashubulks.mobile',
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#111827',
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            package: 'com.vashubulks.mobile',
            newArchEnabled: false
        },
        plugins: ["expo-system-ui"],
        web: {
            favicon: './assets/favicon.png',
        },
        extra: {
            appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
            appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
            appwriteDatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            appwriteMealsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MEALS_COLLECTION_ID,
            appwriteRequirementsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REQUIREMENTS_COLLECTION_ID,
            geminiApiKey: process.env.GEMINI_API_KEY,
            "eas": {
                "projectId": "4eb0895f-17ee-4d3d-b94f-81e89d0f1122"
            },
        },
    },
};
