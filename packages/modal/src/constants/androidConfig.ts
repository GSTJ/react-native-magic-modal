/**
 * Android-specific configuration to address Issue #155
 * Navigation immediately after modal hide causes crashes on Android
 * These settings provide safer defaults for Android
 */
export const ANDROID_SAFE_ANIMATION_DURATION = 1;
export const ANDROID_HIDE_CALLBACK_DELAY = 50;
export const ANDROID_NAVIGATION_DELAY = 100;