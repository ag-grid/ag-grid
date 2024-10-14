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

export function _escapeString(toEscape?: string | null, skipEscapingHtmlChars?: boolean): string | null {
    if (toEscape == null) {
        return null;
    }

    // we call toString() twice, in case value is an object, where user provides
    // a toString() method, and first call to toString() returns back something other
    // than a string (eg a number to render)
    const stringResult = toEscape.toString().toString();

    if (skipEscapingHtmlChars) {
        return stringResult;
    }

    // in react we don't need to escape html characters, as it's done by the framework
    return stringResult.replace(reUnescapedHtml, (chr) => HTML_ESCAPES[chr]);
}
