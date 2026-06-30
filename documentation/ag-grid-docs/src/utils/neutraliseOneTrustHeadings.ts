/**
 * The OneTrust cookie-consent banner and preference centre (GTM-injected,
 * production-only) render their own heading elements into the page, which
 * pollute the document heading outline — bad for assistive-tech heading
 * navigation and for SEO heading-structure audits (SE-44).
 *
 * OneTrust's markup is third-party and injected client-side, so we cannot fix
 * it at source. This neutralises the injected headings non-destructively: each
 * heading inside the OneTrust consent container is given `role="presentation"`,
 * which removes it from the heading hierarchy while leaving the element — its
 * id, classes and visible text — intact, so OneTrust's own scripts and styling
 * keep working.
 */

const ONETRUST_ROOT_SELECTOR = '#onetrust-consent-sdk';
const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';
const PROCESSED_ATTR = 'data-ag-heading-neutralised';

/**
 * Strip heading semantics from every heading inside `root`. Returns the number
 * of headings newly neutralised (already-processed headings are skipped).
 */
export function demoteOneTrustHeadings(root: Document | Element): number {
    const headings = root.querySelectorAll<HTMLElement>(HEADING_SELECTOR);
    let count = 0;
    for (let i = 0, len = headings.length; i < len; i++) {
        const heading = headings[i];
        if (heading.getAttribute(PROCESSED_ATTR) === 'true') {
            continue;
        }
        heading.setAttribute('role', 'presentation');
        heading.setAttribute(PROCESSED_ATTR, 'true');
        count++;
    }
    return count;
}

/**
 * Watch for the OneTrust consent container and demote any headings it renders,
 * now and as the preference-centre modal injects more later. Safe to call on
 * every page: when OneTrust is absent (dev, or before consent loads) the
 * observers simply never match.
 */
export function neutraliseOneTrustHeadings(doc: Document = document): void {
    const watch = (root: HTMLElement) => {
        demoteOneTrustHeadings(root);
        // OneTrust injects the preference-centre modal lazily, so keep watching
        // the consent container for further headings.
        const observer = new MutationObserver(() => demoteOneTrustHeadings(root));
        observer.observe(root, { childList: true, subtree: true });
    };

    const existing = doc.querySelector<HTMLElement>(ONETRUST_ROOT_SELECTOR);
    if (existing) {
        watch(existing);
        return;
    }

    const body = doc.body;
    if (!body) {
        return;
    }

    // The consent SDK is appended to <body> after GTM loads it; watch for it.
    const bodyObserver = new MutationObserver(() => {
        const root = doc.querySelector<HTMLElement>(ONETRUST_ROOT_SELECTOR);
        if (root) {
            bodyObserver.disconnect();
            watch(root);
        }
    });
    bodyObserver.observe(body, { childList: true });
}
