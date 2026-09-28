export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export function explosionAt(progress: number) {
  if (progress < .16) return 0;
  if (progress < .45) return clamp((progress - .16) / .29);
  if (progress < .79) return 1;
  return 1 - clamp((progress - .79) / .17);
}
export function partProgress(explosion: number, interval: [number, number]) { return smooth((explosion - interval[0]) / (interval[1] - interval[0])); }
export function stageAt(p: number) { return p < .12 ? 'hero' : p < .21 ? 'intro' : p < .45 ? 'explode' : p < .79 ? 'explore' : p < .96 ? 'reassemble' : 'final'; }
