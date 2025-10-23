// components/product/productUtils.ts

// ---------- Formatting ----------
export function formatNumber(value: number | string, digits: number = 0): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(n)) return digits > 0 ? "0.0".padEnd(2 + digits, "0") : "0";
  return n.toFixed(digits);
}

// ---------- Stats Types ----------
export type ColumnStat = {
  min: number;
  max: number;
  mean: number;
};

export type ColumnStatsMap = Record<string, ColumnStat>;

// ---------- Stats Computation ----------
/**
 * Compute min/max/mean for provided numeric columns.
 * Non-finite values are ignored.
 */
export function getColumnStats<T extends object, K extends keyof T & string>(
  rows: T[],
  numericColumns: readonly K[]
): ColumnStatsMap {
  const stats: ColumnStatsMap = {};

  for (const col of numericColumns) {
    const vals: number[] = [];
    for (const r of rows) {
      const v = Number(r[col]); // col is keyof T, so this is safe
      if (Number.isFinite(v)) vals.push(v);
    }
    if (vals.length === 0) {
      stats[col] = { min: 0, max: 0, mean: 0 };
      continue;
    }
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    stats[col] = { min, max, mean };
  }

  return stats;
}


// ---------- Gentle Heat Class ----------
/**
 * Gentle text color scaling based on percentile within [min, max].
 * Use for subtle emphasis. Combine with getExtremeClass for bold extremes.
 */
export function getCellClass(
  column: string,
  value: number | string,
  stats: ColumnStatsMap
): string {
  const v = Number(value);
  const s = stats[column];
  if (!Number.isFinite(v) || !s) return "";

  const span = s.max - s.min;
  const p = span === 0 ? 0.5 : (v - s.min) / span; // 0..1

  if (p >= 0.8) return "text-green-700";
  if (p >= 0.6) return "text-green-600";
  if (p <= 0.2) return "text-red-700";
  if (p <= 0.4) return "text-red-600";
  return "text-gray-700";
}

// ---------- Extreme Highlight (CELL) ----------
/**
 * STRICT highlight for ONLY the exact highest and exact lowest values.
 * - Exact equality (===) with stats.min/stats.max.
 * - If multiple rows share the exact min or max, all of those rows are highlighted.
 * - If the column has no variation (min === max), nothing is highlighted.
 *
 * Use this when applying the class to the <td> itself.
 *
 * Usage:
 * <td className={`p-3 text-center ${getCellClass(...)} ${getExtremeClass("composite", v, stats, ["composite"])}`}>
 *   {formatNumber(v)}
 * </td>
 */
export function getExtremeClass(
  column: string,
  value: number | null | undefined,
  stats: ColumnStatsMap,
  highlightColumns?: string[]
): string {
  if (highlightColumns && !highlightColumns.includes(column)) return "";
  const v = Number(value);
  const s = stats[column];
  if (!Number.isFinite(v) || !s) return "";

  const span = s.max - s.min;
  // No variation → don't highlight anything
  if (span === 0) return "";

  if (v === s.max) return "bg-green-50 text-green-800 font-semibold ring-1 ring-green-300";
  if (v === s.min) return "bg-red-50 text-red-800 font-semibold ring-1 ring-red-300";
  return "";
}

// ---------- Extreme Highlight (CHIP) ----------
/**
 * Same strict logic as getExtremeClass, but returns classes for an
 * inline "pill/chip" you can wrap around the value (so you don't
 * pad/round the entire <td>).
 *
 * Usage:
 * <td className="p-3 text-center">
 *   <span className={getExtremeChipClass("composite", v, stats, ["composite"])}>
 *     {formatNumber(v)}
 *   </span>
 * </td>
 */
export function getExtremeChipClass(
  column: string,
  value: number | null | undefined,
  stats: ColumnStatsMap,
  highlightColumns?: string[]
): string {
  if (highlightColumns && !highlightColumns.includes(column)) return "";
  const v = Number(value);
  const s = stats[column];
  if (!Number.isFinite(v) || !s) return "";

  const span = s.max - s.min;
  if (span === 0) return "";

  if (v === s.max) {
    return "inline-block px-2 py-0.5 rounded-full bg-green-50 text-green-800 font-semibold ring-1 ring-green-300";
  }
  if (v === s.min) {
    return "inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-800 font-semibold ring-1 ring-red-300";
  }
  return "";
}
