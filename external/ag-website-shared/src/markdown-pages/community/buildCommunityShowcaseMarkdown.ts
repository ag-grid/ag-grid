import { buildMarkdownFrontmatter } from '../markdownFrontmatter';
import { type CommunityMarkdownOptions, renderShowcase, showcaseFavourites, showcaseOther } from './communityContent';

/**
 * Build the markdown twin of /community/showcase: our hand-picked favourites and the full list
 * of open-source projects built with the product. Reads the same showcase.json the page renders.
 */
export function buildCommunityShowcaseMarkdown({
    product,
    siteRoot,
    siteFrontmatter,
}: CommunityMarkdownOptions): string {
    const frontmatter = buildMarkdownFrontmatter({
        ...siteFrontmatter,
        title: `${product}: Showcase`,
        description: `${product}'s products are downloaded millions of times per week. Most projects are internal and closed source, but we've hand-picked 200+ open-source examples to help inspire your next project.`,
    });

    const document = [
        frontmatter,
        `# Open-Source Projects powered by ${product}`,
        `${product}'s products are downloaded millions of times per week. Most projects are internal and closed source, but we've hand-picked open-source examples to help inspire your next project.`,
        `## Our Favourites\n\n${renderShowcase(showcaseFavourites(), siteRoot)}`,
        `## Full Showcase\n\n${renderShowcase(showcaseOther(), siteRoot)}`,
    ].join('\n\n');

    return `${document.trimEnd()}\n`;
}
