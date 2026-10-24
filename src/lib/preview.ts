/**
 * Self-contained web preview (one HTML file, hosted where only inline assets
 * load). The host page embeds the brand fonts itself, so the app skips its
 * own font loading. Never set for the native app.
 */
export const isWebPreview = process.env.EXPO_PUBLIC_WEB_PREVIEW === '1';
