import type { ExpoConfig } from 'expo/config';

import brand from './src/brand/brand.json';

/**
 * Native config reads every brand value from src/brand — a rebrand never touches this file.
 * Store-sensitive settings live here: permission strings (Turkish, specific), privacy
 * manifest, export compliance, Sign in with Apple. Nothing requests background location.
 */
const googleMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

const config: ExpoConfig = {
  name: brand.name,
  slug: brand.slug,
  scheme: brand.scheme,
  version: '1.0.0',
  orientation: 'portrait',
  icon: brand.icon,
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: false,
    bundleIdentifier: brand.bundleId,
    usesAppleSignIn: true,
    infoPlist: {
      CFBundleDevelopmentRegion: 'tr',
      CFBundleAllowMixedLocalizations: true,
      // Only standard HTTPS/TLS from the OS is used.
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'İlanının yaklaşık konumunu belirlemek, görevliyken sana yakın işleri göstermek ve kapıya vardığını kaydetmek için konumunu kullanırız. Konumun yalnızca uygulama açıkken kullanılır.',
      NSCameraUsageDescription: 'İş öncesi ve sonrası kanıt fotoğrafı çekmek için kamerayı kullanırız.',
      NSPhotoLibraryUsageDescription: 'İlanına veya teslim kanıtına galeriden fotoğraf eklemek için kullanılır.',
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyTrackingDomains: [],
      NSPrivacyAccessedAPITypes: [
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults', NSPrivacyAccessedAPITypeReasons: ['CA92.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp', NSPrivacyAccessedAPITypeReasons: ['C617.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime', NSPrivacyAccessedAPITypeReasons: ['35F9.1'] },
        { NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace', NSPrivacyAccessedAPITypeReasons: ['E174.1'] },
      ],
    },
  },
  android: {
    package: brand.bundleId,
    adaptiveIcon: {
      backgroundColor: brand.adaptiveIcon.background,
      foregroundImage: brand.adaptiveIcon.foreground,
      monochromeImage: brand.adaptiveIcon.monochrome,
    },
    predictiveBackGestureEnabled: false,
    blockedPermissions: ['android.permission.ACCESS_BACKGROUND_LOCATION', 'android.permission.RECORD_AUDIO'],
    ...(googleMapsKey ? { config: { googleMaps: { apiKey: googleMapsKey } } } : {}),
  },
  web: { favicon: brand.favicon, output: 'single' },
  plugins: [
    // Single-file web previews cannot lazy-load route chunks, so they bundle every route up front.
    ['expo-router', process.env.EXPO_PUBLIC_WEB_PREVIEW === '1' ? { asyncRoutes: { web: false } } : {}],
    'expo-font',
    ['expo-splash-screen', { image: brand.splash.image, imageWidth: brand.splash.imageWidth, backgroundColor: brand.splash.background }],
    'expo-apple-authentication',
    'expo-web-browser',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'İlanının yaklaşık konumunu belirlemek, görevliyken sana yakın işleri göstermek ve kapıya vardığını kaydetmek için konumunu kullanırız. Konumun yalnızca uygulama açıkken kullanılır.',
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: 'İş öncesi ve sonrası kanıt fotoğrafı çekmek için kamerayı kullanırız.',
        photosPermission: 'İlanına veya teslim kanıtına galeriden fotoğraf eklemek için kullanılır.',
        microphonePermission: false,
      },
    ],
    ['expo-notifications', { color: brand.adaptiveIcon.background }],
  ],
  extra: {
    eas: process.env.EAS_PROJECT_ID ? { projectId: process.env.EAS_PROJECT_ID } : undefined,
  },
};

export default config;
