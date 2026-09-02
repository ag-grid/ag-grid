import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { VIDEO_TOUR_TEXT, VIDEO_TOUR_URL } from '@components/demos/demosData';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import demosData from '../../content/demos/demos.json';

export type DemoName = keyof typeof demosData;

/** The demo's page copy — shared with the `.astro` page so the two cannot drift. */
export function demoContent(demo: DemoName) {
    return demosData[demo];
}

/**
 * Build the markdown twin of a standalone demo page (`/example-finance`, `/example-hr`,
 * `/example-inventory`). The demo itself is a live React grid with no markdown representation, so
 * the twin carries the page's copy and its links, and points at the source on GitHub — which is
 * the useful thing for an agent asked how the demo is built.
 */
export function buildDemoMarkdown({ demo, siteRoot }: { demo: DemoName; siteRoot?: string }): string {
    const content = demoContent(demo);

    const document = [
        [
            '---',
            `title: ${JSON.stringify(content.metaTitle)}`,
            `description: ${JSON.stringify(content.metaDescription)}`,
            '---',
        ].join('\n'),
        `# ${content.heading}`,
        content.bodyText,
        'This page hosts a live, interactive AG Grid demo. The full source is on GitHub.',
        [
            `[See on GitHub](${content.githubUrl})`,
            `[View the demo](${toAbsoluteUrl(urlWithBaseUrl(`/example-${demo}/`), siteRoot)})`,
            `[${VIDEO_TOUR_TEXT}](${VIDEO_TOUR_URL})`,
            `[Contact us](${toAbsoluteUrl(urlWithBaseUrl('/contact/'), siteRoot)})`,
        ].join(' | '),
    ];

    return `${document.join('\n\n').trimEnd()}\n`;
}
