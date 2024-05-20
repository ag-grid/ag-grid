import { JSDOM } from 'jsdom';

import type { CategorizedSitemap } from '../Sitemap';

export default function parseSitemap(xml: string) {
    const dom = new JSDOM();
    const parser = new dom.window.DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    const parsedDoc = Array.from(xmlDoc.querySelectorAll('url > loc')).map((loc) => loc.textContent ?? '');
    return categorizeUrls(parsedDoc);
}

const categorizeUrls = (urls: string[]): CategorizedSitemap => {
    const categorisedSitemap: CategorizedSitemap = {};

    urls.forEach((url: string) => {
        const urlObj = new URL(url);
        const path = urlObj.pathname.split('/').filter(Boolean);

        // Determine category
        if (path.length === 0) return;
        const category: string = path.length === 1 ? 'General' : parsePathName(path[0]);

        // Extract page name
        const pageName = parsePathName(path[path.length - 1] || '');

        // Add to the categories object
        if (!categorisedSitemap[category]) categorisedSitemap[category] = [];
        categorisedSitemap[category].push({ url, pageName });
    });

    return categorisedSitemap;
};

const parsePathName = (pathname: string): string => {
    return pathname.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};
