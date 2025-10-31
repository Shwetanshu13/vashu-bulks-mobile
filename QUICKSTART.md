# 🚀 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Expo Go app on your phone (or Android Studio/Xcode for emulators)
- Existing Appwrite project from the web version
- Google Gemini API key

## 5-Minute Setup

### 1. Create `.env` file

```bash
# Copy from your web app's .env.local
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68f551b2002ec90c4e50
NEXT_PUBLIC_APPWRITE_DATABASE_ID=68f553330029a43f363a
NEXT_PUBLIC_APPWRITE_MEALS_COLLECTION_ID=your-meals-id
NEXT_PUBLIC_APPWRITE_REQUIREMENTS_COLLECTION_ID=your-requirements-id
GEMINI_API_KEY=your-gemini-key
```

### 2. Install dependencies (if not already done)

```bash
npm install
```

### 3. Start the app

```bash
npm start
```

### 4. Run on your device

- **Phone**: Scan the QR code with Expo Go app
- **Android Emulator**: Press `a`
- **iOS Simulator**: Press `i` (macOS only)

## First Time Setup Flow

1. **Launch app** → See login screen
2. **Sign up** → Create account with email/password
3. **Navigate to Settings** → Set daily targets (e.g., 2500 cal, 150g protein)
4. **Log a meal**:
   - Option A: Manual entry with exact values
   - Option B: AI entry - "Chicken breast with rice and broccoli"
5. **View Today tab** → See your daily totals
6. **Check Calendar** → View nutrition history with color codes

## Testing AI Features

Try these meal descriptions:

- "A bowl of oatmeal with banana and blueberries"
- "Grilled chicken breast with sweet potato and green beans"
- "Protein shake with whey protein and almond milk"
- "Two eggs scrambled with cheese and whole wheat toast"

## Troubleshooting

### App won't start

```bash
rm -rf node_modules
npm install
npm start --clear
```

### Environment variables not loading

- Check `.env` file exists in project root
- Restart Expo server after creating/editing `.env`
- Verify no typos in variable names

### "Network Error" or connection issues

- Verify Appwrite endpoint is correct
- Check you're connected to internet
- Ensure Appwrite project is active

### Calendar shows no data

- Make sure you've set daily targets in Settings
- Verify meals are being saved (check Today tab)
- Pull down to refresh

## 🎉 You're Ready!

Your app is now fully functional. All data syncs with your web version automatically!

**Need help?** Check `README.md` for detailed documentation.
