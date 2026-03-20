// ============================================
// Async delay helper — simulates network latency
// ============================================

/**
 * Returns a promise that resolves after a random delay
 * between `min` and `max` milliseconds.
 */
export function delay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
