export const radius = {
  4: 4,
  6: 6,
  8: 8,
  10: 10,
  12: 12,
  16: 16,
  full: 9999,
  // Semantic shortcuts
  badge: 6,
  chip: 6,
  iconButton: 8,
  input: 10,
  segmented: 10,
  listRow: 10,
  card: 12,
  dialog: 12,
  button: 12,
  pill: 9999,
  // Legacy aliases
  xs: 4,
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 16,
} as const;

export type RadiusKey = keyof typeof radius;
