import Markdoc, { type Node } from '@markdoc/markdoc';
import type { MarkdownHeading } from 'astro';
import GithubSlugger from 'github-slugger';

const TABS_TAG_NAME = 'tabs';
const TAB_ITEM_TAG_NAME = 'tabItem';

function isTabsTag({ tag, type }: Node) {
    return type === 'tag' && tag === TABS_TAG_NAME;
}

function isTabItemTag({ tag, type }: Node) {
    return type === 'tag' && tag === TAB_ITEM_TAG_NAME;
}

/**
 * Extract markdoc `{% tabs %}` tag data from content
 */
function getMarkdocTabs(content: string) {
    const root = Markdoc.parse(content);
    const slugger = new GithubSlugger();
    let lastHeading: Node;

    return root.children
        .map((node) => {
            if (node.type === 'heading') {
                lastHeading = node;
            }

            if (!isTabsTag(node) || !lastHeading || node.attributes.omitFromOverview) {
                return;
            }

            const { level } = lastHeading.attributes;
            const { content } = lastHeading.children[0].children[0].attributes;
            const heading: MarkdownHeading = { slug: slugger.slug(content), depth: level, text: content.trim() };
            const tabItems = node.children.filter(isTabItemTag).map(({ attributes }) => attributes);

            return { heading, tabItems };
        })
        .filter(<T>(val: T | undefined): val is T => val != null);
}

export function addTabsToHeadings({
    headings,
    markdocContent,
    getTabItemSlug,
}: {
    headings: MarkdownHeading[];
    markdocContent: string;
    getTabItemSlug: (id: string) => string;
}) {
    const headingsClone = headings.slice();

    for (const tab of getMarkdocTabs(markdocContent)) {
        const tabHeadingIndex = headingsClone.findIndex(({ slug }) => slug === tab.heading.slug);

        if (tabHeadingIndex === -1) continue;

        const tabItemsHeading: MarkdownHeading[] = tab.tabItems.map(({ id, label }) => ({
            slug: getTabItemSlug(id),
            depth: tab.heading.depth + 1,
            text: label,
        }));

        headingsClone.splice(tabHeadingIndex + 1, 0, ...tabItemsHeading);
    }

    return headingsClone;
}
