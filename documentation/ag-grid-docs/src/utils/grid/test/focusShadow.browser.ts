/**
 * In-page half of the focus shadow audit.
 *
 * Find outset focus shadows that are clipped by an ancestor.
 *
 * MUST stay self-contained. `page.evaluate` serialises the function source, so every helper is declared inside
 * it - a reference to anything at module scope throws at runtime in the page.
 */

export type FocusShadowIssue = {
    /** The node carrying the shadow: the focused element, or an ancestor styling it through `:focus-within`. */
    shadowOn: string;
    /** The innermost ancestor that cuts the shadow. Outer clippers only cut it because this one does. */
    clippedBy: string;
    /** The shadow that focus added, resolved to pixels. */
    boxShadow: string;
    /** The clipping ancestor's `overflow-x/overflow-y`. */
    overflow: string;
};

/**
 * Focuses every focusable element in the grid and reports any whose focus shadow is clipped.
 *
 * The caller must have established keyboard modality (one `page.keyboard.press('Tab')`) or programmatic focus
 * will not match `:focus-visible` and no focus styles will apply at all.
 */
export function auditFocusShadows(): FocusShadowIssue[] {
    const AG_ROOTS = '.ag-root-wrapper, .ag-popup, .ag-dialog, .ag-menu, .ag-dnd-ghost';
    const CLIPPING_OVERFLOW = new Set(['hidden', 'scroll', 'auto', 'clip']);
    /** Subpixel layout means an element flush against its container can measure a hair either side of it. */
    const EPSILON = 0.5;
    /**
     * Cells and everything in them are out of scope, editors and cell renderers included. They outnumber every
     * other focusable element in a typical example by an order of magnitude, and a cell whose focus indicator
     * is cut could not reach a release unnoticed.
     */
    const NOT_AUDITED = '.ag-cell';

    const issues: FocusShadowIssue[] = [];
    const restoreFocusTo = document.activeElement;

    // --- identity -------------------------------------------------------------------------------------------

    const baseToken = (el: Element): string => {
        const classes = Array.from(el.classList)
            .filter((name) => name.startsWith('ag-'))
            .sort();
        return el.tagName.toLowerCase() + classes.map((name) => '.' + name).join('');
    };

    /**
     * Sibling tokens for a whole parent at once. Several identical components can share a container with only
     * one of them against its edge, so repeats are numbered - `.ag-foo`, `.ag-foo[1]` - and the whole set has to
     * be built together to know which are repeats.
     */
    const siblingTokens = new WeakMap<Element, Map<Element, string>>();
    const tokensFor = (parent: Element): Map<Element, string> => {
        let tokens = siblingTokens.get(parent);
        if (tokens) {
            return tokens;
        }
        tokens = new Map();
        const counts = new Map<string, number>();
        for (const child of Array.from(parent.children)) {
            const base = baseToken(child);
            const index = counts.get(base) ?? 0;
            counts.set(base, index + 1);
            tokens.set(child, index === 0 ? base : `${base}[${index}]`);
        }
        siblingTokens.set(parent, tokens);
        return tokens;
    };

    const tokenFor = (el: Element): string => {
        const parent = el.parentElement;
        return parent ? (tokensFor(parent).get(el) ?? baseToken(el)) : baseToken(el);
    };

    /**
     * The element's position, outermost first, as `div.ag-root-wrapper > div.ag-toolbar > button.ag-button`.
     * The chain stops at the grid root because nothing above it can affect grid focus styles. Cached per element
     * so a deep tree costs one token per node rather than one chain per node.
     */
    const siteCache = new WeakMap<Element, string>();
    const siteOf = (el: Element): string => {
        const cached = siteCache.get(el);
        if (cached !== undefined) {
            return cached;
        }
        const parent = el.parentElement;
        const site = !parent || el.matches(AG_ROOTS) ? tokenFor(el) : `${siteOf(parent)} > ${tokenFor(el)}`;
        siteCache.set(el, site);
        return site;
    };

    // --- shadows --------------------------------------------------------------------------------------------

    const shadowOf = (el: Element): string => getComputedStyle(el).boxShadow;

    /**
     * How far the shadow reaches beyond the border box. Focus shadows carry no offset, so blur plus spread is
     * the reach, and summing the resolved pixel lengths gets there without parsing the value's structure.
     * Reading the computed value rather than assuming a fixed extent keeps this true for every theme.
     */
    const shadowExtent = (shadow: string): number =>
        (shadow.match(/[\d.]+px/g) ?? []).reduce((total, length) => total + parseFloat(length), 0);

    // --- clipping -------------------------------------------------------------------------------------------

    /** Establishes a containing block even for `position: fixed` descendants. */
    const isContainingBlock = (cs: CSSStyleDeclaration): boolean =>
        cs.transform !== 'none' ||
        cs.perspective !== 'none' ||
        cs.filter !== 'none' ||
        cs.backdropFilter !== 'none' ||
        /paint|layout|strict|content/.test(cs.contain) ||
        /transform|perspective|filter/.test(cs.willChange);

    /**
     * The ancestors that genuinely clip `el`, innermost first. An `overflow: hidden` ancestor does not clip a
     * positioned descendant unless it is in that descendant's containing-block chain, which is why absolutely
     * positioned popups sitting inside scrollers are not reported.
     *
     * The walk stops at the grid root. Above it the clipping is the host page's, not the grid's: the docs
     * example page sizes its body to the grid exactly, so every element flush against the grid's own edge is
     * flush against the page's too, and reporting that says nothing about grid CSS.
     */
    const clippingAncestors = (el: Element) => {
        const clippers: { el: Element; cs: CSSStyleDeclaration; clipsX: boolean; clipsY: boolean }[] = [];
        let subject: Element = el;
        let scrolledX = false;
        let scrolledY = false;
        for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
            const subjectPosition = getComputedStyle(subject).position;
            const cs = getComputedStyle(ancestor);
            if (subjectPosition === 'fixed' && !isContainingBlock(cs)) {
                continue;
            }
            if (subjectPosition === 'absolute' && cs.position === 'static' && !isContainingBlock(cs)) {
                continue;
            }

            const clipsX = !scrolledX && CLIPPING_OVERFLOW.has(cs.overflowX);
            const clipsY = !scrolledY && CLIPPING_OVERFLOW.has(cs.overflowY);
            if (clipsX || clipsY) {
                clippers.push({ el: ancestor, cs, clipsX, clipsY });
            }
            // A scroller is measured itself but ends its axis: further out the element's distance to the edge is
            // whatever this scroller's offset makes it, and being at this scroller's own edge is already tested.
            scrolledX ||= ancestor.scrollWidth > ancestor.clientWidth + 1;
            scrolledY ||= ancestor.scrollHeight > ancestor.clientHeight + 1;
            if (ancestor.matches(AG_ROOTS)) {
                break;
            }
            // Above a containing block it is that block's own position that governs, not the original element's.
            subject = ancestor;
        }
        return clippers;
    };

    /** Overflow clips to the padding box, so border widths come off the bounding rect. */
    const paddingBox = (el: Element, cs: CSSStyleDeclaration) => {
        const rect = el.getBoundingClientRect();
        return {
            left: rect.left + parseFloat(cs.borderLeftWidth),
            top: rect.top + parseFloat(cs.borderTopWidth),
            right: rect.right - parseFloat(cs.borderRightWidth),
            bottom: rect.bottom - parseFloat(cs.borderBottomWidth),
        };
    };

    /**
     * How far `node` sits from each content edge of `clipper`, in the clipper's scroll coordinates. With nothing
     * scrolled the content box is the padding box, so this is the plain gap; with content scrolled the gaps are
     * still to the content's own edges, which is what makes a finding a property of the layout and not of the
     * scroll offset.
     */
    const contentGaps = (node: Element, clipper: Element, cs: CSSStyleDeclaration) => {
        const box = node.getBoundingClientRect();
        const pad = paddingBox(clipper, cs);
        const left = box.left - pad.left + clipper.scrollLeft;
        const top = box.top - pad.top + clipper.scrollTop;
        return {
            left,
            top,
            right: clipper.scrollWidth - (left + box.width),
            bottom: clipper.scrollHeight - (top + box.height),
        };
    };

    /** The innermost ancestor that cuts a shadow of `extent` around `node`, or null if the shadow has room. */
    const findClipper = (node: Element, extent: number) => {
        // A negative gap is the node itself crossing the edge, which is not its shadow being cut.
        const cut = (gap: number) => gap > -EPSILON && gap < extent - EPSILON;
        for (const { el: ancestor, cs, clipsX, clipsY } of clippingAncestors(node)) {
            const gap = contentGaps(node, ancestor, cs);
            if ((clipsX && (cut(gap.left) || cut(gap.right))) || (clipsY && (cut(gap.top) || cut(gap.bottom)))) {
                return { ancestor, cs };
            }
        }
        return null;
    };

    // --- audit ----------------------------------------------------------------------------------------------

    /** The element and its ancestors up to the grid root: the shadow may be on any of them. */
    const chainOf = (el: Element): Element[] => {
        const chain: Element[] = [el];
        for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
            chain.push(ancestor);
            if (ancestor.matches(AG_ROOTS)) {
                break;
            }
        }
        return chain;
    };

    // Descending stops at a cell rather than collecting its subtree and rejecting it afterwards: in a grid of
    // any size the cells hold most of the DOM, and none of it is in scope.
    const candidates: HTMLElement[] = [];
    const visited = new Set<Element>();
    const collect = (el: Element) => {
        if (visited.has(el) || el.matches(NOT_AUDITED)) {
            return;
        }
        visited.add(el);
        if (el instanceof HTMLElement) {
            candidates.push(el);
        }
        for (const child of Array.from(el.children)) {
            collect(child);
        }
    };
    for (const root of Array.from(document.querySelectorAll(AG_ROOTS))) {
        collect(root);
    }

    for (const el of candidates) {
        // An element with no box cannot show a shadow.
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            continue;
        }

        // Each candidate stays focused once measured, so without this an element is compared against itself.
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        const chain = chainOf(el);
        const shadowsBefore = chain.map(shadowOf);

        // Focusability is tested rather than inferred: the grid uses `tabindex="-1"` heavily, and `focus()` on
        // anything unfocusable is a no-op. preventScroll keeps the geometry about to be measured still.
        el.focus({ preventScroll: true });
        if (document.activeElement !== el) {
            continue;
        }

        for (let i = 0; i < chain.length; i++) {
            const node = chain[i]!;
            const shadow = shadowOf(node);
            // Unchanged means this node has no focus shadow; `inset` means it has one that cannot be clipped.
            if (shadow === shadowsBefore[i] || shadow === 'none' || /\binset\b/.test(shadow)) {
                continue;
            }

            const clipper = findClipper(node, shadowExtent(shadow));
            if (!clipper) {
                continue;
            }

            issues.push({
                shadowOn: siteOf(node),
                clippedBy: siteOf(clipper.ancestor),
                boxShadow: shadow,
                overflow: `${clipper.cs.overflowX}/${clipper.cs.overflowY}`,
            });
        }
    }

    if (restoreFocusTo instanceof HTMLElement) {
        restoreFocusTo.focus({ preventScroll: true });
    } else if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    return issues;
}
