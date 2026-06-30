// @vitest-environment jsdom
import { demoteOneTrustHeadings, neutraliseOneTrustHeadings } from './neutraliseOneTrustHeadings';

describe('demoteOneTrustHeadings', () => {
    test('gives every heading role="presentation" and marks it processed', () => {
        const root = document.createElement('div');
        root.innerHTML = `
            <h2 id="onetrust-policy-title">We use cookies</h2>
            <div><h3>Cookie settings</h3><p>body</p></div>
        `;

        const count = demoteOneTrustHeadings(root);

        expect(count).toBe(2);
        const headings = root.querySelectorAll('h2, h3');
        headings.forEach((h) => {
            expect(h.getAttribute('role')).toBe('presentation');
            expect(h.getAttribute('data-ag-heading-neutralised')).toBe('true');
        });
    });

    test('leaves the element, id and text intact (non-destructive)', () => {
        const root = document.createElement('div');
        root.innerHTML = `<h2 id="onetrust-policy-title" class="ot-title">We use cookies</h2>`;

        demoteOneTrustHeadings(root);

        const heading = root.querySelector('#onetrust-policy-title')!;
        expect(heading.tagName).toBe('H2');
        expect(heading.classList.contains('ot-title')).toBe(true);
        expect(heading.textContent).toBe('We use cookies');
    });

    test('is idempotent — re-running does not re-process already-demoted headings', () => {
        const root = document.createElement('div');
        root.innerHTML = `<h2>We use cookies</h2>`;

        expect(demoteOneTrustHeadings(root)).toBe(1);
        expect(demoteOneTrustHeadings(root)).toBe(0);
    });
});

describe('neutraliseOneTrustHeadings', () => {
    test('demotes headings inside an already-present consent container', () => {
        document.body.innerHTML = `
            <main><h1>Real page heading</h1></main>
            <div id="onetrust-consent-sdk">
                <div id="onetrust-banner-sdk"><h2>We use cookies</h2></div>
            </div>
        `;

        neutraliseOneTrustHeadings(document);

        // OneTrust heading is demoted...
        expect(document.querySelector('#onetrust-banner-sdk h2')!.getAttribute('role')).toBe('presentation');
        // ...but the page's own heading is untouched.
        expect(document.querySelector('main h1')!.getAttribute('role')).toBeNull();
    });

    test('does nothing when the OneTrust container is absent (e.g. dev / no consent SDK)', () => {
        document.body.innerHTML = `<main><h1>Real page heading</h1></main>`;

        expect(() => neutraliseOneTrustHeadings(document)).not.toThrow();
        expect(document.querySelector('main h1')!.getAttribute('role')).toBeNull();
    });
});
