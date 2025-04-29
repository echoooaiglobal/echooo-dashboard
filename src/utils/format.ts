// src/utils/format.ts

/**
 * Format a number to a readable string (e.g., 1200 -> 1.2K)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }