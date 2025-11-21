# Mobile App Dependencies for NMC Learning Module

## Required Dependencies for React Native/Expo App

### Core Navigation
```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "react-native-screens": "^3.27.0",
  "react-native-safe-area-context": "^4.7.4"
}
```

### State Management & Data Fetching
```json
{
  "@tanstack/react-query": "^5.17.0"
}
```

**Note:** This app uses React Query for server state (API data, caching) and React Context for global auth state. Zustand is not needed.

### Supabase & API
```json
{
  "@supabase/supabase-js": "^2.38.4",
  "react-native-url-polyfill": "^2.0.0"
}
```

### UI Components & Icons
```json
{
  "react-native-vector-icons": "^10.0.3",
  "@expo/vector-icons": "^14.0.0"
}
```

### Media Players
```json
{
  "expo-av": "^13.10.4",
  "react-native-video": "^6.0.0-rc.0"
}
```

### Flashcards & Animations
```json
{
  "react-native-reanimated": "^3.6.1",
  "react-native-gesture-handler": "^2.14.0"
}
```

### Utilities
```json
{
  "date-fns": "^3.0.6",
  "clsx": "^2.1.0"
}
```

## Installation Commands

### Using Expo (Recommended)
```bash
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @tanstack/react-query
npx expo install @supabase/supabase-js react-native-url-polyfill
npx expo install expo-av
npx expo install react-native-reanimated react-native-gesture-handler
npm install date-fns clsx
```

### Additional Dependencies for Features

#### For Rich Text Display (Lesson Content)
```bash
npm install react-native-render-html
```

#### For Progress Tracking
```bash
npm install react-native-circular-progress
npm install react-native-progress
```

#### For Authentication (Google/Apple Sign-In)
```bash
npx expo install expo-auth-session expo-web-browser
npx expo install @react-native-google-signin/google-signin
npx expo install expo-apple-authentication
```

#### For Payment Integration
```bash
npm install @stripe/stripe-react-native
npm install react-native-razorpay
```

#### For Notifications
```bash
npx expo install expo-notifications
```

## Configuration Files

### babel.config.js
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

### app.json / app.config.js
```json
{
  "expo": {
    "plugins": [
      "expo-router",
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone for audio lessons."
        }
      ]
    ]
  }
}
```

## Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
EXPO_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

## TypeScript Types

Ensure `tsconfig.json` includes:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## iOS Specific

### Podfile Configuration
After installing dependencies, run:
```bash
cd ios && pod install && cd ..
```

## Android Specific

### android/app/build.gradle
Ensure minimum SDK version:
```gradle
minSdkVersion = 21
targetSdkVersion = 33
```

## Testing Dependencies
```bash
npm install --save-dev @testing-library/react-native jest-expo
```

## Complete Package.json Example

```json
{
  "name": "jeeva-mobile-app",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-av": "~13.10.4",
    "expo-router": "~3.4.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@tanstack/react-query": "^5.17.0",
    "@supabase/supabase-js": "^2.38.4",
    "react-native-url-polyfill": "^2.0.0",
    "react-native-vector-icons": "^10.0.3",
    "react-native-reanimated": "^3.6.1",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-render-html": "^6.3.4",
    "date-fns": "^3.0.6",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  }
}
```

## Notes

1. **Expo vs React Native CLI**: This guide assumes Expo. If using React Native CLI, some packages may require linking.

2. **Video Player**: Choose between `expo-av` (simpler, good for basic video) or `react-native-video` (more features, requires native linking).

3. **Flashcard Animations**: Use `react-native-reanimated` for smooth flip animations.

4. **HTML Content**: Use `react-native-render-html` to display rich text content from TipTap editor.

5. **Testing**: Run the app after each major dependency installation to catch platform-specific issues early.

## Troubleshooting

### iOS Build Issues
```bash
cd ios
rm -rf Pods Podfile.lock
pod deintegrate
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

### Metro Bundler Cache
```bash
npx expo start --clear
```
