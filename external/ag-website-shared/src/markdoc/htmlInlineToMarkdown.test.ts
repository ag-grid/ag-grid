import { describe, expect, it } from 'vitest';

import { htmlBlockToMarkdown, htmlInlineToMarkdown } from './htmlInlineToMarkdown';

const SITE_ROOT = 'https://www.ag-grid.com/';

describe('htmlInlineToMarkdown', () => {
    it('converts anchors, resolving site-relative hrefs against the site root', () => {
        expect(htmlInlineToMarkdown('See <a href="/about/">about us</a>.', SITE_ROOT)).toBe(
            'See [about us](https://www.ag-grid.com/about/).'
        );
    });

    it('leaves external, mailto and anchor hrefs untouched', () => {
        expect(htmlInlineToMarkdown('<a href="https://x.com/ag_grid">X</a>', SITE_ROOT)).toBe(
            '[X](https://x.com/ag_grid)'
        );
        expect(htmlInlineToMarkdown('<a href="mailto:a@b.com">mail</a>', SITE_ROOT)).toBe('[mail](mailto:a@b.com)');
        expect(htmlInlineToMarkdown('<a href="#top">top</a>', SITE_ROOT)).toBe('[top](#top)');
    });

    it('keeps emphasis rather than flattening it', () => {
        expect(htmlInlineToMarkdown('Add <b>fast</b> and <strong>rich</strong> grids')).toBe(
            'Add **fast** and **rich** grids'
        );
        expect(htmlInlineToMarkdown('an <em>idea</em> and an <i>aside</i>')).toBe('an *idea* and an *aside*');
        expect(htmlInlineToMarkdown('call <code>setGridOption()</code>')).toBe('call `setGridOption()`');
    });

    it('moves whitespace outside the emphasis delimiters, which CommonMark requires', () => {
        // `** foo **` is not emphasis; the spaces have to sit outside the markers.
        expect(htmlInlineToMarkdown('over<b> 90% </b>of the Fortune 500')).toBe('over **90%** of the Fortune 500');
    });

    it('drops empty emphasis rather than emitting stray markers', () => {
        expect(htmlInlineToMarkdown('a<b></b>b')).toBe('ab');
    });

    it('strips remaining tags and collapses whitespace', () => {
        expect(htmlInlineToMarkdown('one<br />two   <span>three</span>')).toBe('onetwo three');
    });
});

describe('htmlBlockToMarkdown', () => {
    it('separates paragraphs into markdown blocks', () => {
        expect(htmlBlockToMarkdown('<p>First para.</p><p>Second para.</p>')).toBe('First para.\n\nSecond para.');
    });

    it('renders a list as a single markdown list, not one block per item', () => {
        expect(htmlBlockToMarkdown('<ul><li>One</li><li>Two</li><li>Three</li></ul>')).toBe('- One\n- Two\n- Three');
    });

    it('keeps a paragraph, a list and a heading as separate blocks in source order', () => {
        const html = '<p>Intro.</p><h6>Section</h6><ul><li>A</li><li>B</li></ul><p>Outro.</p>';
        expect(htmlBlockToMarkdown(html)).toBe('Intro.\n\n###### Section\n\n- A\n- B\n\nOutro.');
    });

    it('converts links and emphasis inside blocks', () => {
        const html = '<p>Read the <a href="https://bryntum.com/docs">docs</a> for <b>Gantt</b>.</p>';
        expect(htmlBlockToMarkdown(html)).toBe('Read the [docs](https://bryntum.com/docs) for **Gantt**.');
    });

    it('converts links inside list items', () => {
        const html = '<ul><li><a href="https://bryntum.com/a">A</a></li><li>plain</li></ul>';
        expect(htmlBlockToMarkdown(html)).toBe('- [A](https://bryntum.com/a)\n- plain');
    });

    it('handles bare text outside any block', () => {
        expect(htmlBlockToMarkdown('Just text, no tags.')).toBe('Just text, no tags.');
    });

    it('returns an empty string for markup with no text content', () => {
        expect(htmlBlockToMarkdown('<p></p><ul></ul>')).toBe('');
    });

    it('leaves no sentinel characters in the output', () => {
        // Checked with includes() rather than a regex: control characters in a regex literal
        // trip eslint's no-control-regex.
        const output = htmlBlockToMarkdown('<p>a</p><ul><li>b</li></ul><p>c</p>');
        expect(output.includes(String.fromCharCode(0)), 'block sentinel leaked').toBe(false);
        expect(output.includes(String.fromCharCode(1)), 'line sentinel leaked').toBe(false);
    });
});
