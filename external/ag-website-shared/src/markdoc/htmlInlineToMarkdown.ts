import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';

/**
 * Resolve a link stored in page content for use in a markdown twin: external and in-page
 * anchor links are left untouched; root- or path-relative links are made absolute against
 * `siteRoot` (a leading slash is added first so relative paths resolve too).
 */
export function resolveContentLink(href: string, siteRoot?: string): string {
    if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) {
        return href;
    }
    return toAbsoluteUrl(href.startsWith('/') ? href : `/${href}`, siteRoot);
}

/**
 * Convert an inline HTML fragment (as stored in landing-page/about/policy content) to markdown:
 * `<a>` links become markdown links with their href resolved, `<strong>`/`<b>` and `<em>`/`<i>`
 * become their markdown emphasis, `<code>` becomes a code span, and any remaining tags are
 * dropped. Handles single- or double-quoted attributes and extra attributes on the anchor.
 */
export function htmlInlineToMarkdown(html: string, siteRoot?: string): string {
    return (
        html
            .replace(
                /<a\s+[^>]*?href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi,
                (_match, href, text) =>
                    `[${text.replace(/<[^>]+>/g, '').trim()}](${resolveContentLink(href, siteRoot)})`
            )
            // Emphasis carries meaning in the source copy, so keep it rather than flattening it.
            .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, (_match, _tag, text) => emphasise(text, '**'))
            .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, (_match, _tag, text) => emphasise(text, '*'))
            .replace(/<code>([\s\S]*?)<\/code>/gi, (_match, text) => `\`${text.replace(/<[^>]+>/g, '').trim()}\``)
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
    );
}

/**
 * Whitespace inside an emphasis tag is moved outside the delimiters, since `** foo **` is not
 * emphasis in CommonMark. An empty tag collapses to nothing rather than to a stray `**`.
 */
function emphasise(text: string, delimiter: string): string {
    const inner = text.replace(/<[^>]+>/g, '');
    const trimmed = inner.trim();
    if (!trimmed) {
        return '';
    }
    const leading = inner.startsWith(' ') ? ' ' : '';
    const trailing = inner.endsWith(' ') ? ' ' : '';
    return `${leading}${delimiter}${trimmed}${delimiter}${trailing}`;
}

// Sentinels marking block and line boundaries, so they survive the inline pass (which collapses
// runs of whitespace). Control characters, so they cannot occur in the source copy.
const BLOCK_SEPARATOR = '\u0000';
const LINE_SEPARATOR = '\u0001';

/** Markers emitted for list items, so an already-converted item is not re-run as inline copy. */
const LIST_MARKER = /^(?:- |\d+\. )/;

/**
 * Convert a block-level HTML fragment (paragraphs, lists and headings, as stored in the Bryntum
 * campaign content) to markdown. Block structure becomes markdown blocks; the text inside each is
 * converted with {@link htmlInlineToMarkdown}, so links and emphasis survive.
 *
 * Anchors are expected to be absolute already — resolve product-relative hrefs before calling
 * (the campaign pages do this with `decorateBryntumHtml`).
 */
export function htmlBlockToMarkdown(html: string, siteRoot?: string): string {
    // Innermost blocks first, so a list item's own markup is consumed before its <ul> wrapper.
    // List items are line-joined into a single markdown list; other blocks are block-separated.
    const marked = html
        // <ol> is consumed whole so its items can be numbered; what reaches the <li> pass below is
        // therefore unordered, and takes the bullet marker.
        .replace(
            /<ol\b[^>]*>([\s\S]*?)<\/ol>/gi,
            (_match, items) => `${numberedListItems(items, siteRoot)}${BLOCK_SEPARATOR}`
        )
        .replace(
            /<li\b[^>]*>([\s\S]*?)<\/li>/gi,
            (_match, text) => `${LINE_SEPARATOR}- ${htmlInlineToMarkdown(text, siteRoot)}`
        )
        .replace(/<\/ul>/gi, BLOCK_SEPARATOR)
        .replace(
            /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
            (_match, level: string, text) =>
                `${BLOCK_SEPARATOR}${'#'.repeat(Number(level))} ${htmlInlineToMarkdown(text, siteRoot)}${BLOCK_SEPARATOR}`
        )
        .replace(
            /<p\b[^>]*>([\s\S]*?)<\/p>/gi,
            (_match, text) => `${BLOCK_SEPARATOR}${htmlInlineToMarkdown(text, siteRoot)}${BLOCK_SEPARATOR}`
        );

    return marked
        .split(BLOCK_SEPARATOR)
        .map((block) =>
            block
                .split(LINE_SEPARATOR)
                // List items are already converted; anything left outside a block (bare text,
                // stray <span>s) is inline copy and still needs converting.
                .map((line) => (LIST_MARKER.test(line) ? line.trim() : htmlInlineToMarkdown(line, siteRoot)))
                .filter(Boolean)
                .join('\n')
        )
        .filter(Boolean)
        .join('\n\n')
        .trim();
}

/** Numbered from 1: `<ol start>` does not appear in the source copy. */
function numberedListItems(items: string, siteRoot?: string): string {
    let position = 0;
    return items.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_match, text) => {
        position += 1;
        return `${LINE_SEPARATOR}${position}. ${htmlInlineToMarkdown(text, siteRoot)}`;
    });
}
