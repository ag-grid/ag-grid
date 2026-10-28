/**
 * Finds links that have no accessible name: no visible text, no image `alt`, and no label. A screen
 * reader announces such a link as just "link", and a crawler has no anchor text to describe its target.
 *
 * The link checker streams each built page one tag at a time rather than holding it in memory, so
 * this is a small state machine fed the same way: every tag, and the text between tags. It only
 * decides what a script can decide. Whether a label is any good ("click here") is a judgement
 * call that is left alone.
 */

const NON_BLANK_LABEL_ATTRIBUTES = ['aria-label', 'aria-labelledby', 'title'];

/** Whitespace as markup writes it: the spaces `trim` already removes, plus the entities for them. */
const INVISIBLE_ENTITIES = /&(?:nbsp|#160|#xa0|#8203|#x200b);/gi;

/** The value of an attribute written with quotes, or undefined when the tag does not carry it. */
export function getTagAttribute(tag: string, name: string): string | undefined {
    return new RegExp(`(?:^|\\s)${name}=(["'])(.*?)\\1`, 'i').exec(tag)?.[2];
}

const hasValue = (tag: string, name: string) => (getTagAttribute(tag, name) ?? '').trim() !== '';

const isLabelledByAttribute = (tag: string) => NON_BLANK_LABEL_ATTRIBUTES.some((name) => hasValue(tag, name));

interface OpenLink {
    href: string;
    labelled: boolean;
}

export class LinkLabelTracker {
    private openLink: OpenLink | undefined;

    /** @param onUnlabelled called with the raw `href` of each link found to have no accessible name */
    constructor(private readonly onUnlabelled: (href: string) => void) {}

    /**
     * Whether text between tags can still change the outcome. Callers skip collecting it
     * otherwise, which keeps a page that is mostly links from being buffered twice.
     */
    get wantsText(): boolean {
        return this.openLink != null && !this.openLink.labelled;
    }

    /** The text between two tags. Any visible character inside a link is a label. */
    text(text: string): void {
        if (this.wantsText && text.replace(INVISIBLE_ENTITIES, '').trim() !== '') {
            this.openLink!.labelled = true;
        }
    }

    /** One tag, without its angle brackets, eg `a href="/x" class="y"` or `/a`. */
    tag(tag: string): void {
        const match = /^(\/?)([a-zA-Z][\w-]*)/.exec(tag);
        if (match == null) {
            return;
        }
        const closing = match[1] === '/';
        const name = match[2].toLowerCase();

        if (name === 'a') {
            if (closing) {
                this.finish();
            } else {
                this.openAnchor(tag);
            }
            return;
        }

        const link = this.openLink;
        if (link == null || link.labelled || closing) {
            return;
        }
        // An image is named by its alt text; a blank one marks it decorative, which names nothing.
        // Anything else inside the link, such as an icon `<svg aria-label="...">`, names it by label.
        if (name === 'img' ? hasValue(tag, 'alt') : isLabelledByAttribute(tag)) {
            link.labelled = true;
        }
    }

    /** Settles a link that is still open when its page ends, which a browser would close there. */
    finish(): void {
        const link = this.openLink;
        this.openLink = undefined;
        if (link != null && !link.labelled) {
            this.onUnlabelled(link.href);
        }
    }

    private openAnchor(tag: string): void {
        // A second anchor cannot nest inside the first: a browser closes the first before it.
        this.finish();

        const href = getTagAttribute(tag, 'href');
        // Without an href it is a placeholder, not a link; hidden from assistive technology,
        // its name is nobody's to read.
        if (href == null || getTagAttribute(tag, 'aria-hidden')?.trim().toLowerCase() === 'true') {
            return;
        }
        this.openLink = { href, labelled: isLabelledByAttribute(tag) };
    }
}
