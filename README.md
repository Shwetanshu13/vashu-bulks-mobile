# 🥗 Vashu Bulks - Mobile App

**AI-Powered Nutrition Tracking on the Go**

Vashu Bulks mobile app brings the power of intelligent nutrition tracking to your smartphone. Built with React Native and Expo, it offers seamless synchronization with your Appwrite backend and AI-powered meal analysis using Google Gemini.

---

## ✨ Features

### 🔐 **Secure Authentication**

- User registration and login with Appwrite
- Persistent sessions with AsyncStorage
- Secure session management

### 📝 **Dual Meal Logging**

- **Manual Entry**: Input precise nutritional values
- **AI-Powered Entry**: Describe your meal and let Gemini AI calculate nutrients instantly

### 🎯 **Personalized Daily Targets**

- Set custom goals for calories, protein, fats, and carbs
- Real-time progress tracking throughout the day
- Visual indicators for meeting, exceeding, or falling short of targets

### 📅 **Interactive Calendar**

- Beautiful calendar with color-coded nutrition history
- Color indicators:
  - 🟢 **Green**: Targets met (within 10% tolerance)
  - 🔵 **Blue**: Surplus (exceeded targets)
  - 🟠 **Orange**: Deficit (below targets)
- Tap any date to view detailed nutrient breakdown and meals
- Future dates disabled automatically

### 📊 **Today's Meals Overview**

- View all meals logged for the current day
- See cumulative totals for all macronutrients
- AI-calculated meals marked with 🤖 badge
- Pull-to-refresh for latest data

### 🎨 **Dark Theme UI**

- Sleek, eye-friendly dark mode design
- Smooth animations and transitions
- Responsive layout for all screen sizes
- Native feel with platform-specific optimizations

---

## 🛠️ Tech Stack

- **[React Native](https://reactnative.dev/)** - Cross-platform mobile framework
- **[Expo](https://expo.dev/)** - Development platform and tools
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Appwrite](https://appwrite.io/)** - Backend as a Service for auth and database
- **[Google Gemini AI](https://ai.google.dev/)** - AI meal analysis
- **[React Navigation](https://reactnavigation.org/)** - Navigation library
- **[React Native Calendars](https://github.com/wix/react-native-calendars)** - Calendar component
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/)** - Local data persistence

---

## 📋 Prerequisites

- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- An Appwrite account and project (same as web version)
- A Google Gemini API key
- For iOS: Xcode (macOS only) or Expo Go app
- For Android: Android Studio or Expo Go app

---

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd f:\Coding\vashu-bulks-mobile
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_MEALS_COLLECTION_ID=your-meals-collection-id
NEXT_PUBLIC_APPWRITE_REQUIREMENTS_COLLECTION_ID=your-requirements-collection-id
GEMINI_API_KEY=your-gemini-api-key
```

**Note**: Use the same Appwrite credentials from your web app for seamless data synchronization!

### 3. Appwrite Configuration

The mobile app uses the same Appwrite database as the web version:

- **Meals Collection**: Same schema as web (userId, date, mealName, calories, protein, fats, carbs, isAIcalculated)
- **Requirements Collection**: Same schema as web (userId, targetCalories, targetProtein, targetFats, targetCarbs)
- **Permissions**: Ensure collection permissions allow authenticated users to create/read/update/delete their own documents

### 4. Run the Development Server

#### Using Expo Go (Recommended for Testing)

```bash
npm start
```

Then:

- Scan the QR code with Expo Go app (Android) or Camera app (iOS)
- Or press `a` for Android emulator
- Or press `i` for iOS simulator (macOS only)

#### Using Development Build

```bash
# For iOS
npm run ios

# For Android
npm run android
```

---

## 📱 Usage Guide

### Getting Started

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Set Your Targets**: Navigate to Settings tab and configure your daily nutrient goals
3. **Log Your First Meal**:
   - **Manual**: Use "Log Meal" tab for precise entry
   - **AI**: Use "AI Meal" tab to describe your meal (e.g., "Two scrambled eggs with toast and avocado")
4. **Track Progress**:
   - Check "Today" tab for current day's summary
   - Use "Calendar" tab to view historical data

### Navigation

- **📋 Today**: View today's meals and daily totals
- **📅 Calendar**: Browse nutrition history with color-coded dates
- **✏️ Log Meal**: Manually enter meal nutrients
- **🤖 AI Meal**: AI-powered meal analysis
- **⚙️ Settings**: Configure daily targets and account settings

---

## 🏗️ Project Structure

```
vashu-bulks-mobile/
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx              # Login/Signup
│   │   ├── DashboardScreen.tsx         # Tab navigator
│   │   ├── TodayMealsScreen.tsx        # Today's meals list
│   │   ├── CalendarScreen.tsx          # Calendar with history
│   │   ├── ManualMealScreen.tsx        # Manual meal entry
│   │   ├── AIMealScreen.tsx            # AI meal analysis
│   │   └── SettingsScreen.tsx          # Settings and targets
│   ├── contexts/
│   │   └── AuthContext.tsx             # Authentication context
│   ├── lib/
│   │   ├── appwrite.ts                 # Appwrite client setup
│   │   ├── auth.ts                     # Auth utilities
│   │   ├── database.ts                 # Database operations
│   │   └── gemini.ts                   # Gemini AI integration
│   ├── constants/
│   │   └── theme.ts                    # Theme colors and styles
│   └── components/                     # Reusable components
├── App.tsx                             # Main app entry
├── app.config.js                       # Expo configuration
├── package.json                        # Dependencies
└── .env                                # Environment variables
```

---

## 🔄 Data Synchronization

The mobile app shares the same Appwrite database with the web version:

- ✅ Login on web, see data on mobile
- ✅ Log meals on mobile, view on web
- ✅ Update targets on either platform
- ✅ Real-time synchronization across devices

---

## 🐛 Troubleshooting

### Connection Issues

- Verify `.env` file has correct Appwrite credentials
- Check internet connection
- Ensure Appwrite project is active

### AI Analysis Not Working

- Verify Gemini API key in `.env`
- Check API quota limits
- Ensure meal description is clear

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
expo start --clear
```

---

## 📦 Building for Production

### Android APK

```bash
# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS IPA

```bash
# Build for TestFlight
eas build --platform ios --profile production
```

---

## 🔐 Security Notes

- Environment variables are loaded securely via `app.config.js`
- Never commit `.env` file to version control
- Appwrite handles authentication securely
- Gemini API key is kept private

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 📧 Support

For support, please open an issue in the repository.

---

**Built with ❤️ for the fitness community**

**Track smarter. Bulk better. 💪**
