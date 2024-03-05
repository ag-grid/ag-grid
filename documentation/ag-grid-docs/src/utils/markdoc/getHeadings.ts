import { type Framework } from '@ag-grid-types';
import Markdoc, { type Node } from '@markdoc/markdoc';
import { type MarkdownHeading } from 'astro';
import Slugger from 'github-slugger';

import { transformMarkdoc } from './transformMarkdoc';

const TABS_TAG_NAME = 'tabs';
const TAB_ITEM_TAG_NAME = 'tabItem';

function isTabsTag({ tag, type }: Node) {
    return type === 'tag' && tag === TABS_TAG_NAME;
}

function isTabItemTag({ tag, type }: Node) {
    return type === 'tag' && tag === TAB_ITEM_TAG_NAME;
}

/**
 * Check if node is a heading
 *
 * @see https://github.com/withastro/astro/blob/1539e04a8e5865027b3a8718c6f142885e7c8d88/packages/integrations/markdoc/src/runtime.ts#L145
 */
function isHeadingTag(node: Node) {
    return (
        Boolean(Markdoc.Tag.isTag(node)) &&
        node.attributes.__collectHeading === true &&
        typeof node.attributes.level === 'number'
    );
}

/**
 * Get markdoc tabs (ie, `{% tabs %}`)
 *
 * Filter out tabs with `omitFromOverview`, do not have a heading directly before it
 */
function getMarkdocTabs(ast: Node) {
    const slugger = new Slugger();
    let lastHeading: Node;

    return ast.children
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

function addTabsToHeadings({
    headings,
    markdocAst,
    getTabItemSlug,
}: {
    headings: MarkdownHeading[];
    markdocAst: Node;
    getTabItemSlug: (id: string) => string;
}) {
    const tabHeadings = getMarkdocTabs(markdocAst);
    const headingsClone = headings.slice();

    for (const tab of tabHeadings) {
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

/**
 * Get headings within markdoc content, resolving headings shown based on framework and adding
 * tab headings
 */
export function getHeadings({
    title,
    markdocContent,
    framework,
    getTabItemSlug,
}: {
    title: string;
    markdocContent: string;
    framework: Framework;
    getTabItemSlug: (id: string) => string;
}): MarkdownHeading[] {
    const { ast, renderTree } = transformMarkdoc({ framework, markdocContent });
    if (!renderTree) {
        return [];
    }

    const renderTreeHeadings = renderTree['children']?.filter(isHeadingTag).map((node) => {
        const { id: slug, level: depth } = node.attributes;
        const [text] = node.children;
        return {
            depth,
            slug,
            text,
        };
    });

    const topHeading = { slug: 'top', depth: 1, text: title };

    const headingsWithTabs = addTabsToHeadings({ headings: renderTreeHeadings, markdocAst: ast, getTabItemSlug });

    return [topHeading, ...headingsWithTabs];
}
