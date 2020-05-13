// Type definitions for @ag-grid-community/core v23.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
/**
 * Serialises a date to a string of format `yyyy-MM-dd`.
 * An alternative separator can be provided to be used instead of hyphens.
 */
export declare function serialiseDate(date: Date, separator?: string): string | null;
/**
 * Serialises a time to a string of format `HH:mm:ss`.
 */
export declare function serialiseTime(date: Date): string | null;
/**
 * Parses a date and time from a string in the format `yyyy-MM-dd HH:mm:ss`
 */
export declare function parseDateTimeFromString(value: string): Date | null;
