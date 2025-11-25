// mimo color palette - "Monster Energy" x "Cyberpunk"

export const Colors = {
  // Base
  background: '#000000',
  white: '#FFFFFF',

  // Accent
  neonLime: '#A6FF00',

  // Grays
  gray: '#666666',
  darkGray: '#333333',
  lightGray: '#999999',

  // Status colors
  success: '#A6FF00',
  error: '#FF3B30',
  warning: '#FF9500',

  // Transparent
  overlay: 'rgba(0, 0, 0, 0.8)',
  cardBg: 'rgba(255, 255, 255, 0.05)',
} as const;

export type ColorKey = keyof typeof Colors;
