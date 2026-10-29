/**
 * Finds links that have no accessible name: no visible text, no image `alt`, and no label. A screen
 * reader announces such a link as just "link", and a crawler has no anchor text to describe its target.
 *
 * The link checker streams each built page one tag at a time rather than holding it in memory, so
 * this is a small state machine fed the same way: every tag, and the text between tags. It only
 * decides what a script can decide. Whether a label is any good ("click here") is a judgement
 * call that is left alone.
 *
 * What names a link: its own `aria-label` or `title`, visible text, an image `alt` or other label
 * inside it, or an `aria-labelledby` that points at an element on the page with a name of its own.
 * Content hidden from assistive technology (`aria-hidden="true"` or `hidden`, and everything under
 * it) names nothing, so a decorative icon cannot stand in for a label.
 */

/** Elements that never have a closing tag, so are never left open. */
const VOID_ELEMENTS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'source',
    'track',
    'wbr',
]);

const attributePatterns = new Map<string, RegExp>();

/** The value of an attribute written with quotes, or undefined when the tag does not carry it. */
export function getTagAttribute(tag: string, name: string): string | undefined {
    let pattern = attributePatterns.get(name);
    if (pattern == null) {
        pattern = new RegExp(`(?:^|\\s)${name}=(["'])(.*?)\\1`, 'i');
        attributePatterns.set(name, pattern);
    }
    return pattern.exec(tag)?.[2];
}

/** The named references that stand for a space or a zero-width character. */
const BLANK_NAMED_ENTITIES = /&(?:nbsp|ensp|emsp|thinsp|ZeroWidthSpace|NewLine|Tab);/gi;
const NUMERIC_ENTITIES = /&#(?:x([0-9a-f]+)|(\d+));/gi;
const VISIBLE_CHARACTER = /[^\s\u200b-\u200d\u2060\ufeff]/;

/**
 * Whether markup, text or an attribute value, shows nothing: empty, whitespace, or only character
 * references for them. The raw HTML is read as it is written, so `&nbsp;` has to be decoded before it
 * can be told from a visible character.
 */
const isBlank = (value: string): boolean => {
    const decoded = value.replace(BLANK_NAMED_ENTITIES, ' ').replace(NUMERIC_ENTITIES, (reference, hex, decimal) => {
        const codePoint = parseInt(hex ?? decimal, hex == null ? 10 : 16);
        // Lone surrogates and out-of-range values would throw; leave them as they were.
        if (!Number.isInteger(codePoint) || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
            return reference;
        }
        return String.fromCodePoint(codePoint);
    });
    return !VISIBLE_CHARACTER.test(decoded);
};

const hasValue = (tag: string, name: string) => {
    const value = getTagAttribute(tag, name);
    return value != null && !isBlank(value);
};

/** Whether a tag names itself: by `aria-label` or `title`, or, for an image, by `alt`. */
const hasOwnName = (tag: string, elementName: string) =>
    hasValue(tag, 'aria-label') || hasValue(tag, 'title') || (elementName === 'img' && hasValue(tag, 'alt'));

/** The ids an `aria-labelledby` points at. */
const getLabelledByIds = (tag: string): string[] =>
    tag.includes('aria-labelledby')
        ? (getTagAttribute(tag, 'aria-labelledby')?.split(/\s+/).filter(Boolean) ?? [])
        : [];

/** Quoted values are blanked first, so that `class="a hidden"` is not mistaken for the attribute. */
const HIDDEN_ATTRIBUTE = /(?:^|\s)hidden(?=\s|=|\/|$)/i;

const isHidden = (tag: string): boolean =>
    tag.includes('hidden') &&
    (getTagAttribute(tag, 'aria-hidden')?.trim().toLowerCase() === 'true' ||
        HIDDEN_ATTRIBUTE.test(tag.replace(/(["']).*?\1/g, '""')));

interface OpenElement {
    name: string;
    id: string | undefined;
}

interface OpenLink {
    href: string;
    labelled: boolean;
    /** Ids of the elements whose names would name the link, checked once the whole page has been seen. */
    labelledBy: string[];
    /** Where the link's own element sits in the stack of open elements. */
    depth: number;
    /** Where the outermost hidden element inside the link sits in the stack, or -1 if none is open. */
    hiddenFrom: number;
}

export class LinkLabelTracker {
    private readonly stack: OpenElement[] = [];
    private openLink: OpenLink | undefined;
    /** Whether each id seen on the page belongs to an element with a name. Known once the page is read. */
    private readonly idHasName = new Map<string, boolean>();
    /** How many open elements have an id and no name yet, so that text is kept only while it can help. */
    private unnamedOpenIds = 0;
    /** Links that rely on `aria-labelledby`, settled by `finish()` as the target may come later in the page. */
    private readonly pending: { href: string; ids: string[] }[] = [];

    /** @param onUnlabelled called with the raw `href` of each link found to have no accessible name */
    constructor(private readonly onUnlabelled: (href: string) => void) {}

    /**
     * Whether text between tags can still change the outcome. Callers skip collecting it
     * otherwise, which keeps a page that is mostly links from being buffered twice.
     */
    get wantsText(): boolean {
        return this.unnamedOpenIds > 0 || this.linkWantsText(this.openLink);
    }

    /** The text between two tags. Any visible character names the open elements and the visible link it is in. */
    text(text: string): void {
        if (isBlank(text)) {
            return;
        }
        if (this.unnamedOpenIds > 0) {
            for (const { id } of this.stack) {
                if (id != null) {
                    this.idHasName.set(id, true);
                }
            }
            this.unnamedOpenIds = 0;
        }
        if (this.openLink != null && this.linkWantsText(this.openLink)) {
            this.openLink.labelled = true;
        }
    }

    /** One tag, without its angle brackets, eg `a href="/x" class="y"` or `/a`. */
    tag(tag: string): void {
        const match = /^(\/?)([a-zA-Z][\w-]*)/.exec(tag);
        if (match == null) {
            return;
        }
        const name = match[2].toLowerCase();

        if (match[1] === '/') {
            this.close(name);
        } else if (name === 'a') {
            this.openAnchor(tag);
        } else {
            this.openElement(name, tag);
        }
    }

    /** Settles what is still open when the page ends, which a browser would close there. */
    finish(): void {
        this.popTo(0);
        for (const { href, ids } of this.pending.splice(0)) {
            if (!ids.some((id) => this.idHasName.get(id) === true)) {
                this.onUnlabelled(href);
            }
        }
    }

    private linkWantsText(link: OpenLink | undefined): boolean {
        return link != null && !link.labelled && link.hiddenFrom === -1;
    }

    private openElement(name: string, tag: string): void {
        const hidden = isHidden(tag);
        const isVoid = VOID_ELEMENTS.has(name) || /\/\s*$/.test(tag);

        // Inside a link, in view of assistive technology: an image's alt text, or any element's own
        // label, names the link. A blank alt marks an image decorative, which names nothing.
        const link = this.openLink;
        if (link != null && this.linkWantsText(link) && !hidden) {
            if (hasOwnName(tag, name)) {
                link.labelled = true;
            }
            link.labelledBy.push(...getLabelledByIds(tag));
        }

        const id = tag.includes('id=') ? getTagAttribute(tag, 'id') : undefined;
        if (id != null) {
            this.registerId(id, hasOwnName(tag, name), !isVoid);
        }
        if (isVoid) {
            return;
        }
        if (link != null && hidden && link.hiddenFrom === -1) {
            link.hiddenFrom = this.stack.length;
        }
        this.stack.push({ name, id });
    }

    private openAnchor(tag: string): void {
        // A second anchor cannot nest inside the first: a browser closes the first before it.
        if (this.openLink != null) {
            this.popTo(this.openLink.depth);
        }

        const id = tag.includes('id=') ? getTagAttribute(tag, 'id') : undefined;
        if (id != null) {
            this.registerId(id, hasOwnName(tag, 'a'), true);
        }
        const depth = this.stack.length;
        this.stack.push({ name: 'a', id });

        const href = getTagAttribute(tag, 'href');
        // Without an href it is a placeholder, not a link; hidden from assistive technology,
        // its name is nobody's to read.
        if (href == null || isHidden(tag)) {
            return;
        }
        this.openLink = {
            href,
            labelled: hasOwnName(tag, 'a'),
            labelledBy: getLabelledByIds(tag),
            depth,
            hiddenFrom: -1,
        };
    }

    private registerId(id: string, named: boolean, open: boolean): void {
        if (named) {
            this.idHasName.set(id, true);
        } else if (this.idHasName.get(id) !== true) {
            this.idHasName.set(id, false);
            if (open) {
                this.unnamedOpenIds++;
            }
        }
    }

    /** A closing tag closes the nearest open element of that name, and any left open inside it. */
    private close(name: string): void {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            if (this.stack[i].name === name) {
                this.popTo(i);
                return;
            }
        }
    }

    private popTo(depth: number): void {
        while (this.stack.length > depth) {
            const index = this.stack.length - 1;
            const { id } = this.stack.pop()!;
            if (id != null && this.idHasName.get(id) === false) {
                this.unnamedOpenIds--;
            }
            const link = this.openLink;
            if (link != null) {
                if (index === link.depth) {
                    this.openLink = undefined;
                    this.settle(link);
                } else if (index === link.hiddenFrom) {
                    link.hiddenFrom = -1;
                }
            }
        }
        if (this.stack.length === 0) {
            this.unnamedOpenIds = 0;
        }
    }

    private settle({ href, labelled, labelledBy }: OpenLink): void {
        if (labelled) {
            return;
        }
        if (labelledBy.length > 0) {
            this.pending.push({ href, ids: labelledBy });
        } else {
            this.onUnlabelled(href);
        }
    }
}
