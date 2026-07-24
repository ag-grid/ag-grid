import { type CommunityMarkdownOptions, renderBlogs, renderPodcasts, renderVideosTable } from './communityContent';

/**
 * Build the markdown twin of /community/media: videos, podcasts and blogs featuring the product.
 * Reads the same videos/podcasts/blogs JSON the page renders.
 */
export function buildCommunityMediaMarkdown({ product, siteRoot }: CommunityMarkdownOptions): string {
    const frontmatter = [
        '---',
        `title: "${product}: Media"`,
        'description: "Browse our appearances in community podcasts, blogs, and events to get the latest news & updates directly from our team."',
        '---',
    ].join('\n');

    const document = [
        frontmatter,
        `# Community Podcasts and Publications featuring ${product}`,
        'Browse our appearances in community podcasts, blogs, and events to get the latest news & updates directly from our team.',
        `## Videos\n\n${renderVideosTable(siteRoot)}`,
        `## Podcasts\n\n${renderPodcasts(siteRoot)}`,
        `## Blogs\n\n${renderBlogs(siteRoot)}`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
