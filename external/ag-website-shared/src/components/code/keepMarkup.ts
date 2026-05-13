import type { DecorationItem } from 'shiki';

/**
 * Extracts embedded HTML tags from a code string and converts them to Shiki
 * decorations, returning the plain-text code Shiki can highlight and the
 * decorations to re-inject the tags afterwards.
 *
 * Handles two patterns produced by the API reference docs pipeline:
 *   - `<a href="..." ...>TypeName</a>` — clickable type links
 *   - `<<span/>` — produced by escapeGenericCode to preserve `<` in generics;
 *     redundant for Shiki (which takes plain text), so it's unwound back to `<`
 */
export function extractDecorations(code: string): { cleanCode: string; decorations: DecorationItem[] } {
    // Undo escapeGenericCode and decode HTML entities — Shiki takes plain text so raw `<` is fine
    const unescaped = code
        .replace(/<<span\/>/g, '<')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');

    const decorations: DecorationItem[] = [];
    let cleanCode = '';
    let i = 0;

    while (i < unescaped.length) {
        if (unescaped[i] === '<' && /^<a\s/.test(unescaped.slice(i, i + 3))) {
            const openTagEnd = unescaped.indexOf('>', i);
            const closeTagStart = unescaped.indexOf('</a>', openTagEnd + 1);

            if (openTagEnd === -1 || closeTagStart === -1) {
                cleanCode += unescaped[i++];
                continue;
            }

            const openTag = unescaped.slice(i, openTagEnd + 1);
            const innerText = unescaped.slice(openTagEnd + 1, closeTagStart);

            const properties: Record<string, string> = {};
            const attrs = openTag.matchAll(/(\w[\w-]*)="([^"]*)"/g);
            for (const [, name, value] of attrs) {
                properties[name] = value;
            }

            const start = cleanCode.length;
            cleanCode += innerText;
            decorations.push({ start, end: cleanCode.length, tagName: 'a', properties });

            i = closeTagStart + '</a>'.length;
        } else {
            cleanCode += unescaped[i++];
        }
    }

    return { cleanCode, decorations };
}
