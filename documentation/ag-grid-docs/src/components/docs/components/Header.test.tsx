import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Header } from './Header';

type HeaderProps = Parameters<typeof Header>[0];

const defaultProps: HeaderProps = {
    title: 'Getting Started',
    framework: 'react',
    path: '/react-data-grid/getting-started/',
    menuItems: [],
};

function getHeadingHtml(props: Partial<HeaderProps> = {}) {
    const html = renderToStaticMarkup(<Header {...defaultProps} {...props} />);
    const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!heading) {
        throw new Error(`No <h1> rendered in:\n${html}`);
    }
    return heading[1];
}

describe('Header', () => {
    it('renders the framework name inside the h1, as search engines index the heading', () => {
        expect(getHeadingHtml()).toContain('React Data Grid');
    });

    it('renders the version inside the h1 when one is given', () => {
        expect(getHeadingHtml({ version: '36.1.0' })).toContain('Version 36.1.0');
    });

    it('omits the framework name from the h1 when it is suppressed', () => {
        const headingHtml = getHeadingHtml({ suppressFrameworkHeader: true });

        expect(headingHtml).not.toContain('React Data Grid');
        expect(headingHtml).toContain('Getting Started');
    });

    it('keeps the page title as a direct text node of the h1, as the Algolia indexer reads only those', () => {
        expect(getHeadingHtml({ version: '36.1.0' })).toMatch(/<\/span>Getting Started$/);
    });
});
