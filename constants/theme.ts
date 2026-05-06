import { Platform } from 'react-native';

// FinanceFlow dark theme palette
export const Colors = {
  // Backgrounds
  bg: '#080D14',
  card: '#0D1827',
  cardAlt: '#121F30',
  cardDark: '#090E18',
  border: '#1A2840',

  // Brand — bright teal-green
  green: '#00D4A0',
  greenLight: '#7FFFD4',
  greenDim: '#003D2E',
  teal: '#2DD4BF',
  blue: '#3B82F6',

  // Text
  text: '#FFFFFF',
  textSub: '#8899AA',
  textMuted: '#4A6278',

  // Status
  red: '#EF4444',
  redLight: '#FCA5A5',
  amber: '#F59E0B',
  amberLight: '#FDE68A',

  // Tabs (legacy compat)
  light: {
    text: '#FFFFFF',
    background: '#080D14',
    tint: '#00D4A0',
    icon: '#8899AA',
    tabIconDefault: '#4A6278',
    tabIconSelected: '#00D4A0',
  },
  dark: {
    text: '#FFFFFF',
    background: '#080D14',
    tint: '#00D4A0',
    icon: '#8899AA',
    tabIconDefault: '#4A6278',
    tabIconSelected: '#00D4A0',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
