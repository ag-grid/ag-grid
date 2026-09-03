import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { demoContent } from '@components/demos/demoContent';
import { VIDEO_TOUR_TEXT, VIDEO_TOUR_URL, demoTabs } from '@components/demos/demosData';

/**
 * Build the markdown twin of the /example (demo) page. The page is almost entirely a live
 * interactive grid, so the twin carries the performance demo's copy — the same copy the page
 * renders, so the two cannot drift — followed by an index of every demo with its live and GitHub
 * links (shared with the page via demosData) and the video / contact links.
 */
export function buildExampleMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const content = demoContent('performance');

    const frontmatter = [
        '---',
        `title: ${JSON.stringify(content.seoTitle)}`,
        `description: ${JSON.stringify(content.seoDescription)}`,
        '---',
    ].join('\n');

    const demos = demoTabs
        .map((tab) => `- **${tab.label}** — [live demo](${toAbsoluteUrl(tab.href, siteRoot)}), [GitHub](${tab.github})`)
        .join('\n');

    // The frameworks the intro names link to their own copy of the demo's source.
    const introMarkdown = content.introSegments.map(({ text, href }) => (href ? `[${text}](${href})` : text)).join('');

    const resources = [
        `- [${VIDEO_TOUR_TEXT}](${VIDEO_TOUR_URL})`,
        `- [Contact Us](${toAbsoluteUrl('/contact/', siteRoot)})`,
    ].join('\n');

    const document = [
        frontmatter,
        `# ${content.seoH1}`,
        introMarkdown,
        `## Demos\n\n${demos}`,
        `## Resources\n\n${resources}`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
