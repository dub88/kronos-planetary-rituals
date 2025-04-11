import { ExpoConfig, ConfigContext } from 'expo/config';

// Read from .env file in development
import 'dotenv/config';

const envConfig = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_SUPABASE_REDIRECT_URL: process.env.EXPO_PUBLIC_SUPABASE_REDIRECT_URL,
  EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Kronos Planetary Rituals",
  slug: "kronos-planetary-rituals",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "kronos",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.kronos.planetaryrituals",
    newArchEnabled: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.kronos.planetaryrituals",
    newArchEnabled: true
  },
  web: {
    bundler: "metro",
    favicon: "./assets/images/favicon.png",
    output: "single",
    build: {
      babel: {
        include: [
          "@expo/vector-icons",
          "react-native-web",
          "expo-modules-core"
        ]
      }
    },
    // Enhanced mobile web compatibility settings
    meta: {
      viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "theme-color": "#ffffff",
      "mobile-web-app-capable": "yes"
    },
    // PWA configuration
    templatePath: "./public/index.html",
    name: "Kronos Planetary Rituals",
    shortName: "Kronos",
    lang: "en",
    scope: "/",
    themeColor: "#ffffff",
    backgroundColor: "#ffffff",
    startUrl: "/",
    display: "standalone",
    orientation: "portrait",
    // Include service worker for offline capabilities
    serviceWorker: {
      src: "/service-worker.js",
      scope: "/"
    }
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        web: {
          polyfills: ["url"]
        },
        ios: {
          newArchEnabled: true
        },
        android: {
          newArchEnabled: true
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  extra: {
    ...envConfig,
  },
});
