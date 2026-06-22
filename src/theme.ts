export const colors = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#555555',
  accent: '#1A56DB',
  listening: '#CC0000',
  border: '#E0E0E0',
  cardBackground: '#F5F5F5',
  buttonText: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const minTouchTarget = 64;

export const borderRadius = 12;

export const defaultFontSize = 22;
export const minFontSize = 16;
export const maxFontSize = 40;
export const fontSizeStep = 2;

export function lineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.6);
}
