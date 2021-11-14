/**
 * It encodes any string in UTF-8 format
 * taken from https://github.com/mathiasbynens/utf8.js
 * @param {string} s
 * @returns {string}
 */
export declare function utf8_encode(s: string | null): string;
/**
 * @param str The string to be repeated
 * @param len The size of the output string
 * @returns A string with size len created from repeated `str`.
 */
export declare function stringRepeat(str: string, len: number): string;
/**
 * @param str The string to be padded
 * @param totalLength The final length needed
 * @param padStr The string to generate the padding
 * @returns The padded string
 */
export declare function padStart(str: string, totalLength: number, padStr: string): string;
/**
 * Converts a camelCase string into hyphenated string
 * from https://gist.github.com/youssman/745578062609e8acac9f
 * @param {string} str
 * @return {string}
 */
export declare function camelCaseToHyphen(str: string): string | null;
/**
 * Converts a hyphenated string into camelCase string
 * from https://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
 * @param {string} str
 * @return {string}
 */
export declare function hyphenToCamelCase(str: string): string | null;
export declare function capitalise(str: string): string;
export declare function escapeString(toEscape?: string | null): string | null;
/**
 * Converts a camelCase string into regular text
 * from: https://stackoverflow.com/questions/15369566/putting-space-in-camel-case-string-using-regular-expression
 * @param {string} camelCase
 * @return {string}
 */
export declare function camelCaseToHumanText(camelCase: string | undefined): string | null;
export declare function startsWith(str: string, matchStart: string): boolean;
