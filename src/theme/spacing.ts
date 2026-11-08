export const spacing = {
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  20: 20,
  24: 24,
  32: 32,
} as const;

export type SpacingKey = keyof typeof spacing;

export const layout = {
  screenHorizontal: spacing[16],
  componentSpacing: spacing[12],
  sectionSpacing: spacing[24],
  touchTargetMin: 44,
} as const;
