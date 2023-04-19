/**
 * It encodes any string in UTF-8 format
 * taken from https://github.com/mathiasbynens/utf8.js
 * @param {string} s
 * @returns {string}
 */
export declare function utf8_encode(s: string | null): string;
export declare function capitalise(str: string): string;
export declare function escapeString(toEscape?: string | null, skipEscapingHtmlChars?: boolean): string | null;
/**
 * Converts a camelCase string into startCase
 * @param {string} camelCase
 * @return {string}
 */
export declare function camelCaseToHumanText(camelCase: string | undefined): string | null;
