/** Distinct pastel hex colors - no two are too similar */
export const PASTEL_PALETTE = [
  "#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF",
  "#B5DEFF", "#C5CAE9", "#E1BEE7", "#F8BBD9", "#D7CCC8",
  "#98D8C8", "#A8E6CF", "#DCEDC1", "#FFD3B6", "#FFAAA5",
  "#B0E0E6", "#C5E8F7", "#D4A5A5", "#9CB4CC", "#F5D5FD",
  "#92CCDD", "#C7EFF0", "#FDC4EC", "#FFC2CB", "#E6E6FA",
  "#D8BFD8", "#AEC6CF", "#B4C4D4",
];

/** Simple color distance (RGB) - not perceptual but good enough to avoid duplicates */
function colorDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

const MIN_DISTANCE = 80;

/** Pick a pastel color that is not too similar to any of the used colors */
export function pickDistinctPastel(usedColors: string[]): string {
  for (const candidate of PASTEL_PALETTE) {
    const tooClose = usedColors.some((u) => colorDistance(candidate, u) < MIN_DISTANCE);
    if (!tooClose) return candidate;
  }
  return PASTEL_PALETTE[usedColors.length % PASTEL_PALETTE.length];
}
