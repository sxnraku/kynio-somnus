export const LIGHT_COLORS = {
  background: '#EDE6D3',
  surface: '#F4EFE2',
  surfaceBorder: '#DDD6C1',
  ink: '#3A3A38',
  inkMuted: '#7A7875',
  accent: '#D9922E', // Âmbar solar
  accentMuted: '#F0C280',
  success: '#3A6B4C',
  error: '#943D3D',
};

export const DARK_COLORS = {
  background: '#161412',
  surface: '#221E1A',
  surfaceBorder: '#332D26',
  ink: '#EDE6D3',
  inkMuted: '#9E9789',
  accent: '#E8A83E', // Âmbar noturno (baixo espetro azul)
  accentMuted: '#7D571C',
  success: '#4E8A63',
  error: '#B85050',
};

export type ThemeColors = typeof LIGHT_COLORS;

export function getCircadianColors(isDark: boolean): ThemeColors {
  return isDark ? DARK_COLORS : LIGHT_COLORS;
}
