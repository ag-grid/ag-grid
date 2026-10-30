// Matches, in order of preference: an existing anchor (with its text), any other HTML tag, or a bare URL.
// Only the bare URL is linkified; the others are returned untouched so a URL that is already linked is
// not wrapped in a second anchor.
const ANCHOR_TAG_OR_URL = /(<a\b[^>]*>[\s\S]*?<\/a>|<[^>]+>)|https:\/\/[^\s<"]+/gi;

export function linkifyUrls(html: string, linkClassName: string): string {
    return html.replace(ANCHOR_TAG_OR_URL, (match, existingHtml) =>
        existingHtml ? match : `<a class="${linkClassName}" target="_blank" href="${match}">${match}</a>`
    );
}
