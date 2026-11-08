import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  ink: '#0B1F1C',
  inkSoft: '#173A33',
  pine: '#0F4C43',
  teal: '#12796A',
  tealSoft: '#D9EDE6',
  sand: '#F7F2E9',
  sandDeep: '#EFE4D2',
  cream: '#FCFAF5',
  white: '#FFFFFF',
  coral: '#F26B4E',
  coralSoft: '#FCE4DD',
  gold: '#D7A24A',
  text: '#12211E',
  textMuted: '#6E7C77',
  border: '#E5DCCC',
  danger: '#C0392B',
  success: '#2E7D5B',
} as const;

export const fonts = {
  display: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const shadow = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#0B1F1C',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 4 },
  default: { shadowColor: 'rgba(11,31,28,0.12)', shadowOpacity: 1, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
});

export const type = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, color: colors.ink } satisfies TextStyle,
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.ink } satisfies TextStyle,
  subtitle: { fontFamily: fonts.displaySemi, fontSize: 20, lineHeight: 26, color: colors.ink } satisfies TextStyle,
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23, color: colors.text } satisfies TextStyle,
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.textMuted } satisfies TextStyle,
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: colors.text } satisfies TextStyle,
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  } satisfies TextStyle,
} as const;