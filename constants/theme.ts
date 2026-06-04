import { Platform } from 'react-native';

// Light palette (forced) — keys preserved for backwards compatibility
export const Colors = {
  // Backgrounds / surfaces
  bg: '#F8F9FA',
  card: '#FFFFFF',
  cardAlt: '#EDEEEF',
  cardDark: '#F3F4F5',
  border: '#E5E1E2',
  divider: 'rgba(0,0,0,0.06)',

  // Brand — primary is black per mock
  primary: '#000000',
  primaryContainer: '#1B1B1B',
  green: '#000000',
  greenLight: '#E2E2E2',
  greenDim: '#F1F1F1',
  teal: '#0050CC',
  blue: '#0266FF',

  // Income / positive amounts
  income: '#009668',
  incomeBg: 'rgba(0,150,104,0.10)',

  // Text
  text: '#191C1D',
  textSub: '#4C4546',
  textMuted: '#7E7576',

  // Status
  red: '#BA1A1A',
  redLight: '#FFDAD6',
  amber: '#B45309',
  amberLight: '#FDE68A',

  // Tabs (legacy compat) — both resolve to light
  light: {
    text: '#191C1D',
    background: '#F8F9FA',
    tint: '#000000',
    icon: '#4C4546',
    tabIconDefault: '#7E7576',
    tabIconSelected: '#000000',
  },
  dark: {
    text: '#191C1D',
    background: '#F8F9FA',
    tint: '#000000',
    icon: '#4C4546',
    tabIconDefault: '#7E7576',
    tabIconSelected: '#000000',
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
