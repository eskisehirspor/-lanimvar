import type { ExpoConfig } from 'expo/config';

import brand from './src/brand/brand.json';

/** Native config reads every brand value from src/brand — a rebrand never touches this file. */
const config: ExpoConfig = {
  name: brand.name,
  slug: brand.slug,
  scheme: brand.scheme,
  version: '0.1.0',
  orientation: 'portrait',
  icon: brand.icon,
  userInterfaceStyle: 'light',
  ios: { supportsTablet: false, bundleIdentifier: brand.bundleId },
  android: {
    package: brand.bundleId,
    adaptiveIcon: {
      backgroundColor: brand.adaptiveIcon.background,
      foregroundImage: brand.adaptiveIcon.foreground,
      monochromeImage: brand.adaptiveIcon.monochrome,
    },
    predictiveBackGestureEnabled: false,
  },
  web: { favicon: brand.favicon, output: 'single' },
  plugins: [
    // Single-file web previews cannot lazy-load route chunks, so they bundle every route up front.
    ['expo-router', process.env.EXPO_PUBLIC_WEB_PREVIEW === '1' ? { asyncRoutes: { web: false } } : {}],
    'expo-font',
    ['expo-splash-screen', { image: brand.splash.image, imageWidth: brand.splash.imageWidth, backgroundColor: brand.splash.background }],
  ],
};

export default config;
