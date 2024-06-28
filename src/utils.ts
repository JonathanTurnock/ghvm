/**
 * Checks if a value is not undefined or null.
 */
export function isNotUndefinedOrNull<T>(
  value?: T | undefined | null,
): value is T {
  return value !== undefined && value !== null;
}
