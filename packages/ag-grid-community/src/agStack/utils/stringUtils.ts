/**
 * Calls toString() twice, in case value is an object, where user provides a toString() method.
 * The first call to toString() returns back something other than a string (eg a number to render)
 */

export function _toString(toEscape?: string | null): string | null {
    return toEscape?.toString().toString() ?? null;
}
