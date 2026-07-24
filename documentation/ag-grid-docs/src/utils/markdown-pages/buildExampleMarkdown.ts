import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { demoTabs } from '@components/demos/demosData';

// The video-tour link shown on the /example page header (example.astro).
const VIDEO_TOUR_URL = 'https://youtu.be/bcMvTUVbMvI';

/**
 * Build the markdown twin of the /example (demo) page. The page is almost entirely a live
 * interactive grid, so the twin is a short index: the page description, each demo with its
 * live and GitHub links (shared with the page via demosData), and the video / contact links.
 */
export function buildExampleMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const frontmatter = [
        '---',
        'title: "AG Grid Demos"',
        'description: "Example showing grid performance with adjustable rows and columns."',
        '---',
    ].join('\n');

    const demos = demoTabs
        .map((tab) => `- **${tab.label}** — [live demo](${toAbsoluteUrl(tab.href, siteRoot)}), [GitHub](${tab.github})`)
        .join('\n');

    const resources = [
        `- [See the video tour](${VIDEO_TOUR_URL})`,
        `- [Contact Us](${toAbsoluteUrl('/contact/', siteRoot)})`,
    ].join('\n');

    const document = [
        frontmatter,
        '# AG Grid Demos',
        'Example showing grid performance with adjustable rows and columns. Explore the live demos below.',
        `## Demos\n\n${demos}`,
        `## Resources\n\n${resources}`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
