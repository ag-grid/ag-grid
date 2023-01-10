/**
 * Serialises a Date to a string of format `yyyy-MM-dd HH:mm:ss`.
 * An alternative separator can be provided to be used instead of hyphens.
 * @param date The date to serialise
 * @param includeTime Whether to include the time in the serialised string
 * @param separator The separator to use between date parts
 */
export declare function serialiseDate(date: Date | null, includeTime?: boolean, separator?: string): string | null;
/**
 * Serialises a Date to a string of format the defined format, does not include time.
 * @param date The date to serialise
 * @param format The string to format the date to, defaults to YYYY-MM-DD
 */
export declare function dateToFormattedString(date: Date, format?: string): string;
/**
 * Parses a date and time from a string in the format `yyyy-MM-dd HH:mm:ss`
 */
export declare function parseDateTimeFromString(value?: string | null): Date | null;
