export interface RandomResult {
  readonly value: number;
  readonly state: number;
}

export function normalizeSeed(seed: number): number {
  const normalized = seed >>> 0;
  return normalized === 0 ? 0x6d2b79f5 : normalized;
}

export function nextRandom(state: number): RandomResult {
  let next = normalizeSeed(state);
  next ^= next << 13;
  next ^= next >>> 17;
  next ^= next << 5;
  next >>>= 0;
  return { value: next / 0x1_0000_0000, state: next };
}

export function randomInteger(state: number, minimum: number, maximum: number): RandomResult {
  const result = nextRandom(state);
  const value = Math.floor(result.value * (maximum - minimum + 1)) + minimum;
  return { value, state: result.state };
}
