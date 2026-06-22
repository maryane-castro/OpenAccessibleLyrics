export const colors = {
  background: '#F7F7FA',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  accent: '#2563EB',
  accentSurface: '#EFF6FF',
  border: '#E5E7EB',
  listening: '#DC2626',
  star: '#F59E0B',
  buttonText: '#FFFFFF',
  // keep for backward compat
  cardBackground: '#FFFFFF',
  accentLight: '#EFF6FF',
};

export const shadow = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const borderRadius = 12;
export const minTouchTarget = 64;

export const defaultFontSize = 22;
export const minFontSize = 16;
export const maxFontSize = 40;
export const fontSizeStep = 2;

export function lineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.55);
}
