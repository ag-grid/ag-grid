import { describe, expect, it } from 'vitest';

import { LinkLabelTracker } from './linkLabel';

/** Feeds `html` to a tracker the way the link checker does and returns the hrefs it reports. */
const unlabelledHrefs = (html: string): string[] => {
    const found: string[] = [];
    const tracker = new LinkLabelTracker((href) => found.push(href));
    for (const part of html.split(/(<[^>]*>)/)) {
        if (part.startsWith('<')) {
            tracker.tag(part.slice(1, -1));
        } else if (part !== '') {
            tracker.text(part);
        }
    }
    tracker.finish();
    return found;
};

describe('LinkLabelTracker', () => {
    describe('labelled links', () => {
        it.each([
            ['text', '<a href="/x/">Pricing</a>'],
            ['text inside a nested element', '<a href="/x/"><span class="label">Pricing</span></a>'],
            ['text beside an icon', '<a href="/x/"><svg viewBox="0 0 1 1"></svg> Pricing</a>'],
            ['an image with alt text', '<a href="/x/"><img src="/logo.svg" alt="AG Grid"></a>'],
            ['an aria-label', '<a href="/x/" aria-label="Pricing"><svg></svg></a>'],
            ['an aria-labelledby', '<a href="/x/" aria-labelledby="heading"><svg></svg></a>'],
            ['a title attribute', '<a href="/x/" title="Pricing"><svg></svg></a>'],
            ['a labelled icon inside', '<a href="/x/"><svg role="img" aria-label="Pricing"></svg></a>'],
            ['an svg title', '<a href="/x/"><svg><title>Pricing</title></svg></a>'],
            ['a visually hidden label', '<a href="/x/"><span class="sr-only">Pricing</span><svg></svg></a>'],
            ['single-quoted attributes', "<a href='/x/' aria-label='Pricing'></a>"],
        ])('%s', (_, html) => {
            expect(unlabelledHrefs(html)).toEqual([]);
        });
    });

    describe('unlabelled links', () => {
        it.each([
            ['an empty link', '<a href="/x/"></a>'],
            ['whitespace only', '<a href="/x/">  \n  </a>'],
            ['a non-breaking space only', '<a href="/x/">&nbsp;</a>'],
            ['an icon only', '<a href="/x/"><svg viewBox="0 0 1 1"><path d="M0 0"></path></svg></a>'],
            ['an image with no alt', '<a href="/x/"><img src="/logo.svg"></a>'],
            ['an image with blank alt', '<a href="/x/"><img src="/logo.svg" alt=""></a>'],
            ['blank labels', '<a href="/x/" aria-label="" title=" "></a>'],
        ])('%s', (_, html) => {
            expect(unlabelledHrefs(html)).toEqual(['/x/']);
        });

        it('reports each one with its own href', () => {
            expect(unlabelledHrefs('<a href="/a/"></a><a href="/b/">B</a><a href="/c/"></a>')).toEqual(['/a/', '/c/']);
        });

        it('reports a link that is never closed', () => {
            expect(unlabelledHrefs('<a href="/x/">')).toEqual(['/x/']);
        });

        it('settles an unclosed link when the next one opens', () => {
            expect(unlabelledHrefs('<a href="/a/"><a href="/b/">B</a>')).toEqual(['/a/']);
        });

        it('does not count text that follows the link', () => {
            expect(unlabelledHrefs('<a href="/x/"></a>Pricing')).toEqual(['/x/']);
        });
    });

    describe('anchors that are not links to name', () => {
        it.each([
            ['an anchor without an href', '<a name="top"></a>'],
            ['a link hidden from assistive technology', '<a href="/x/" aria-hidden="true" tabindex="-1"></a>'],
        ])('%s', (_, html) => {
            expect(unlabelledHrefs(html)).toEqual([]);
        });

        it('does not let a hidden link close the next one early', () => {
            expect(unlabelledHrefs('<a href="/a/" aria-hidden="true"></a><a href="/b/"></a>')).toEqual(['/b/']);
        });
    });

    it('stops asking for text once the link is labelled', () => {
        const tracker = new LinkLabelTracker(() => undefined);
        tracker.tag('a href="/x/"');
        expect(tracker.wantsText).toBe(true);
        tracker.tag('img src="/logo.svg" alt="AG Grid"');
        expect(tracker.wantsText).toBe(false);
    });

    it('does not ask for text outside a link', () => {
        const tracker = new LinkLabelTracker(() => undefined);
        expect(tracker.wantsText).toBe(false);
        tracker.tag('a href="/x/"');
        tracker.tag('/a');
        expect(tracker.wantsText).toBe(false);
    });
});
