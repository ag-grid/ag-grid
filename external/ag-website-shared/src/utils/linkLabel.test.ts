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
            ['an image with an aria-label', '<a href="/x/"><img src="/logo.svg" aria-label="AG Grid"></a>'],
            ['an image with a title', '<a href="/x/"><img src="/logo.svg" title="AG Grid"></a>'],
            [
                'an aria-label on an image beside a blank alt',
                '<a href="/x/"><img src="/a.svg" alt="" aria-label="AG Grid"></a>',
            ],
            ['an aria-label', '<a href="/x/" aria-label="Pricing"><svg></svg></a>'],
            [
                'an aria-labelledby that names an element',
                '<h2 id="heading">Pricing</h2><a href="/x/" aria-labelledby="heading"><svg></svg></a>',
            ],
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
            ['an aria-label of only a non-breaking space', '<a href="/x/" aria-label="&nbsp;"><svg></svg></a>'],
            ['an alt of only a numeric space reference', '<a href="/x/"><img src="/a.svg" alt="&#160;"></a>'],
            ['an alt of only a hex zero-width space', '<a href="/x/"><img src="/a.svg" alt="&#x200B;"></a>'],
            ['a title of mixed blank references', '<a href="/x/" title=" &nbsp;&#32;&ensp; "></a>'],
            ['text of only blank references', '<a href="/x/">&#32;&#x20;&ZeroWidthSpace;</a>'],
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

    describe('content hidden from assistive technology', () => {
        it.each([
            ['text in an aria-hidden span', '<a href="/x/"><span aria-hidden="true">About</span></a>'],
            ['text in a hidden element', '<a href="/x/"><span hidden>About</span></a>'],
            [
                'an svg title in an aria-hidden svg',
                '<a href="/x/"><svg aria-hidden="true"><title>About</title></svg></a>',
            ],
            ['alt text on a hidden image', '<a href="/x/"><img src="/a.svg" alt="About" aria-hidden="true"></a>'],
            ['a label on a hidden element', '<a href="/x/"><svg aria-hidden="true" aria-label="About"></svg></a>'],
            [
                'text deep inside a hidden element',
                '<a href="/x/"><span aria-hidden="true"><b><i>About</i></b></span></a>',
            ],
            ['an image hidden by its parent', '<a href="/x/"><span hidden><img src="/a.svg" alt="About"></span></a>'],
            [
                'an element hidden by a quoted hidden attribute value',
                '<a href="/x/"><span aria-hidden="TRUE">About</span></a>',
            ],
        ])('does not name a link: %s', (_, html) => {
            expect(unlabelledHrefs(html)).toEqual(['/x/']);
        });

        it.each([
            ['text beside a hidden icon', '<a href="/x/"><span aria-hidden="true"><svg></svg></span>About</a>'],
            [
                'text after a hidden subtree of the same element name',
                '<a href="/x/"><span aria-hidden="true"><span>x</span></span><span>About</span></a>',
            ],
            ['an aria-hidden="false" element', '<a href="/x/"><span aria-hidden="false">About</span></a>'],
            ['a class that merely contains the word hidden', '<a href="/x/"><span class="a hidden">About</span></a>'],
            [
                'a hidden icon with a labelled sibling',
                '<a href="/x/"><svg aria-hidden="true"></svg><img src="/a.svg" alt="About"></a>',
            ],
            ['a void element inside', '<a href="/x/"><br>About</a>'],
            ['a self-closing child', '<a href="/x/"><svg><path d="M0 0"/></svg>About</a>'],
        ])('still names a link: %s', (_, html) => {
            expect(unlabelledHrefs(html)).toEqual([]);
        });

        it('does not let the end of a hidden subtree end a visible label before it', () => {
            expect(unlabelledHrefs('<a href="/x/"><span>About</span><span aria-hidden="true">x</span></a>')).toEqual(
                []
            );
        });

        it('forgets a hidden subtree once it closes', () => {
            expect(unlabelledHrefs('<a href="/x/"><span aria-hidden="true">x</span> About</a>')).toEqual([]);
        });
    });

    describe('aria-labelledby', () => {
        it.each([
            ['a target before the link', '<h2 id="h">Pricing</h2><a href="/x/" aria-labelledby="h"></a>'],
            ['a target after the link', '<a href="/x/" aria-labelledby="h"></a><h2 id="h">Pricing</h2>'],
            [
                'a target with its text in a nested element',
                '<h2 id="h"><span>Pricing</span></h2><a href="/x/" aria-labelledby="h"></a>',
            ],
            [
                'a target named by its own aria-label',
                '<span id="h" aria-label="Pricing"></span><a href="/x/" aria-labelledby="h"></a>',
            ],
            [
                'an image target named by its alt text',
                '<img id="h" alt="Pricing" src="/a.svg"><a href="/x/" aria-labelledby="h"></a>',
            ],
            [
                'one good target among several ids',
                '<span id="b">Pricing</span><a href="/x/" aria-labelledby="a b"></a>',
            ],
            [
                'a reference from an element inside the link',
                '<h2 id="h">Pricing</h2><a href="/x/"><span aria-labelledby="h"></span></a>',
            ],
        ])('names a link with %s', (_, html) => {
            expect(unlabelledHrefs(html)).toEqual([]);
        });

        it.each([
            ['an id that is not on the page', '<a href="/x/" aria-labelledby="missing"><svg></svg></a>'],
            ['a target with no text', '<span id="h"></span><a href="/x/" aria-labelledby="h"></a>'],
            ['a target with only whitespace', '<span id="h"> &nbsp; </span><a href="/x/" aria-labelledby="h"></a>'],
            [
                'a target whose text is after it closes',
                '<span id="h"></span>Pricing<a href="/x/" aria-labelledby="h"></a>',
            ],
            ['an empty reference list', '<a href="/x/" aria-labelledby=""><svg></svg></a>'],
            [
                'a reference to an image with a blank alt',
                '<img id="h" alt="" src="/a.svg"><a href="/x/" aria-labelledby="h"></a>',
            ],
        ])('does not name a link with %s', (_, html) => {
            expect(unlabelledHrefs(html)).toEqual(['/x/']);
        });

        it('reports a link when one of its references is dangling and the rest are empty', () => {
            expect(unlabelledHrefs('<span id="a"></span><a href="/x/" aria-labelledby="a b"></a>')).toEqual(['/x/']);
        });

        it('settles every link that relies on a reference once the page ends', () => {
            expect(
                unlabelledHrefs(
                    '<a href="/a/" aria-labelledby="h"></a><a href="/b/" aria-labelledby="gone"></a><h2 id="h">T</h2>'
                )
            ).toEqual(['/b/']);
        });

        it('lets an own label win without needing the reference to resolve', () => {
            expect(unlabelledHrefs('<a href="/x/" aria-label="About" aria-labelledby="gone"></a>')).toEqual([]);
        });
    });

    it('does not carry state from one open element to a later page region', () => {
        expect(unlabelledHrefs('<div><span id="h"></span></div><a href="/x/"></a>')).toEqual(['/x/']);
    });

    it('asks for text while a named target is still empty, and stops once it has some', () => {
        const tracker = new LinkLabelTracker(() => undefined);
        expect(tracker.wantsText).toBe(false);
        tracker.tag('h2 id="h"');
        expect(tracker.wantsText).toBe(true);
        tracker.text('Pricing');
        expect(tracker.wantsText).toBe(false);
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
