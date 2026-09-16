import { describe, expect, it } from 'vitest';

import eulaSource from '../../content/policies/eula.mdoc?raw';
import { EULA_CLICKWRAP_CONTENT, EULA_CONTENT } from '../markdown-pages/eulaContent';
import { renderEulaHtml } from './renderEulaHtml';

describe('renderEulaHtml', () => {
    const html = renderEulaHtml(eulaSource);

    it('is a complete standalone document with the page heading and no site layout', () => {
        expect(html.startsWith('<!doctype html>')).toBe(true);
        expect(html).toContain(`<title>${EULA_CONTENT.heading}</title>`);
        expect(html).toContain(`<h1>${EULA_CONTENT.heading}</h1>`);
        expect(html.match(/<h1>/g)?.length).toBe(1);
        expect(html).not.toContain('<nav');
        expect(html).not.toContain('<script');
        expect(html.trimEnd().endsWith('</html>')).toBe(true);
        expect(html).toContain('max-width: 52em');
    });

    it('renders the preamble, the clauses and the schedules', () => {
        expect(html).toContain('<h4>Version: 40</h4>');
        expect(html).toContain('PLEASE READ THESE LICENCE TERMS (v40) CAREFULLY BEFORE DOWNLOADING ANY SOFTWARE:');
        expect(html).toContain('Definitions and interpretation');
        expect(html).toContain('Schedule 1: Support Services');
        expect(html).toContain('Schedule 2: GDPR SSCs');
        expect(html).toContain('<strong>BY USING OUR SOFTWARE, YOU CONFIRM THAT YOU ACCEPT');
    });

    it('renders the click-to-accept notice for the ecommerce iframe', () => {
        const clickwrap = renderEulaHtml(eulaSource, { content: EULA_CLICKWRAP_CONTENT });
        expect(clickwrap).toContain('<strong>BY CLICKING ON THE “I ACCEPT” BUTTON BELOW, YOU CONFIRM THAT YOU ACCEPT');
        expect(clickwrap).toContain(
            'DO NOT AGREE TO THE TERMS OF THIS LICENCE, DO NOT CLICK ON THE “I ACCEPT” BUTTON BELOW.'
        );
        expect(clickwrap).not.toContain('USE THE SOFTWARE');
        // The checkout presents the current agreement only, so no version or last-updated lines.
        expect(clickwrap).not.toContain('<h4>Version: 40</h4>');
        expect(clickwrap).not.toContain('<h4>Last Updated:');
        // Otherwise only the two notices differ from the package licence.
        const metaLines = EULA_CONTENT.meta.map((line) => `<h4>${line}</h4>\n`).join('');
        expect(
            clickwrap
                .replace('BY CLICKING ON THE “I ACCEPT” BUTTON BELOW', 'BY USING OUR SOFTWARE')
                .replace('DO NOT CLICK ON THE “I ACCEPT” BUTTON BELOW', 'DO NOT USE THE SOFTWARE')
        ).toBe(html.replace(metaLines, ''));
    });

    it('imposes no width when embedded, so the iframe controls how the text flows', () => {
        const embedded = renderEulaHtml(eulaSource, { embedded: true });
        expect(embedded).not.toContain('max-width');
        expect(embedded).toContain('body { margin: 0; padding: 0 1em;');
    });
});
