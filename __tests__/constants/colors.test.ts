import { LIGHT_COLORS, DARK_COLORS } from '@/constants/colors';

describe('Circadian Color Palette', () => {
  it('should define correct warm paper background for light mode', () => {
    expect(LIGHT_COLORS.background).toBe('#EDE6D3');
    expect(LIGHT_COLORS.ink).toBe('#3A3A38');
    expect(LIGHT_COLORS.accent).toBe('#D9922E');
    expect(LIGHT_COLORS.surface).toBe('#F4EFE2');
    expect(LIGHT_COLORS.surfaceBorder).toBe('#DDD6C1');
  });

  it('should define warm charcoal night palette for dark mode', () => {
    expect(DARK_COLORS.background).toBe('#161412');
    expect(DARK_COLORS.ink).toBe('#EDE6D3');
    expect(DARK_COLORS.accent).toBe('#E8A83E');
    expect(DARK_COLORS.surface).toBe('#221E1A');
    expect(DARK_COLORS.surfaceBorder).toBe('#332D26');
  });
});
