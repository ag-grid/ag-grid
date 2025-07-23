import { _toString } from '../agStack/utils/stringUtils';

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

export function _escapeString(toEscape?: string | null): string | null {
    // in react we don't need to escape html characters, as it's done by the framework
    return _toString(toEscape)?.replace(reUnescapedHtml, (chr) => HTML_ESCAPES[chr]) ?? null;
}
