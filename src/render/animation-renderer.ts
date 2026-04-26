// Animation helpers - MVP minimal version
export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
