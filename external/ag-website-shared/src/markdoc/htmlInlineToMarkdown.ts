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
 * Convert an inline HTML fragment (as stored in landing-page/about content) to markdown:
 * `<a>` links become markdown links with their href resolved, and any remaining tags are
 * dropped. Handles single- or double-quoted attributes and extra attributes on the anchor.
 */
export function htmlInlineToMarkdown(html: string, siteRoot?: string): string {
    return html
        .replace(
            /<a\s+[^>]*?href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi,
            (_match, href, text) => `[${text.replace(/<[^>]+>/g, '').trim()}](${resolveContentLink(href, siteRoot)})`
        )
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
