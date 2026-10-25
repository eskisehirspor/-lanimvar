/** Support contacts (set per environment). The emergency number is always 112. */
export const supportContact = {
  email: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'destek@example.com',
  phone: process.env.EXPO_PUBLIC_SUPPORT_PHONE || '',
};
