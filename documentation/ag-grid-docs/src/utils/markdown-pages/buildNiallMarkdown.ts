import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import niallData from '../../content/about/niall.json';

/**
 * Build the markdown twin of the /niall memorial page. Reads the same niall.json the page renders,
 * so the tribute cannot drift between the two. The photographs are represented by their captions
 * and alt text, which is all a text rendering can carry.
 */
export function buildNiallMarkdown({ siteRoot }: { siteRoot?: string } = {}): string {
    const { meta, eyebrow, heading, intro, photos, sections } = niallData;

    const document: string[] = [
        ['---', `title: ${JSON.stringify(meta.title)}`, `description: ${JSON.stringify(meta.description)}`, '---'].join(
            '\n'
        ),
        `# ${heading}`,
        `*${eyebrow}*`,
        intro,
    ];

    // Photos are interleaved between the prose sections, matching the page's ordering.
    sections.forEach((paragraphs, index) => {
        const photo = photos[index];
        if (photo) {
            const src = toAbsoluteUrl(urlWithBaseUrl(photo.src), siteRoot);
            document.push(`![${photo.alt}](${src})${photo.caption ? `\n\n*${photo.caption}*` : ''}`);
        }
        document.push(...paragraphs);
    });

    return `${document.join('\n\n').trimEnd()}\n`;
}
