const reUnescapedHtml = /[&<>"']/g;

/**
 * HTML Escapes.
 */
const HTML_ESCAPES: { [id: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

/**
 * Calls toString() twice, in case value is an object, where user provides a toString() method.
 * The first call to toString() returns back something other than a string (eg a number to render)
 */
export function _toString(toEscape?: string | null): string | null {
    return toEscape?.toString().toString() ?? null;
}

export function _escapeString(toEscape?: string | null): string | null {
    // in react we don't need to escape html characters, as it's done by the framework
    return _toString(toEscape)?.replace(reUnescapedHtml, (chr) => HTML_ESCAPES[chr]) ?? null;
}
