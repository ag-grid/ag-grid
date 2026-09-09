export interface PolicySection {
    /** The `id` from the heading's `{% id="..." %}` annotation, used as the fragment. */
    id: string;
    /** The heading text, e.g. `Acceptance of Terms`. */
    title: string;
}

// A numbered section heading in a policy `.mdoc`, e.g. `1.  ### Acceptance of Terms {% id="acceptance-of-terms" %}`.
const SECTION_HEADING = /^\s*\d+\.\s+#{2,4}\s+(?<title>.+?)\s+\{%\s*id="(?<id>[^"]+)"\s*%\}\s*$/gm;

/**
 * The sections of a policy `.mdoc`, in document order, read from its numbered headings. Pages
 * build their table of contents from this rather than repeating the titles and ids by hand,
 * so an edit to the policy cannot leave the navigation stale.
 */
export function getPolicySections(mdocSource: string): PolicySection[] {
    return Array.from(mdocSource.matchAll(SECTION_HEADING), ({ groups }) => ({
        id: groups!.id,
        // Headings are Markdoc source, so drop the escapes markdown needs for literal punctuation.
        title: groups!.title.replace(/\\(.)/g, '$1'),
    }));
}
