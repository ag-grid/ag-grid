import type { Framework } from '@ag-grid-types';
import type { MarkdownFramework } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { urlWithPrefix } from '@utils/urlWithPrefix';

import { markdownTable } from './markdownTable';
import { toAbsoluteUrl } from './toAbsoluteUrl';

export interface ModuleNode {
    name: string;
    moduleName?: string;
    path?: string;
    isEnterprise?: boolean;
    hideFromSelection?: boolean;
    children?: ModuleNode[];
}

/**
 * Build the `moduleMappings` tag as a flat GFM table of every module (leaf nodes of
 * the module tree): the feature name (linked to its docs when a `path` is set), the
 * module name, and whether it is an Enterprise module. Pure (no `astro:content`) so
 * it is unit-testable; the dispatcher loads the tree and calls this. Interactive
 * selection state from the on-page tree is irrelevant to a static reference.
 */
export function buildModuleMappingsTable(
    groups: ModuleNode[],
    framework: MarkdownFramework,
    siteRoot?: string
): string {
    const leaves: { name: string; moduleName: string; path?: string; isEnterprise: boolean }[] = [];
    collectLeaves(groups ?? [], false, leaves);

    const rows = leaves.map((leaf) => {
        // Module `path` values are bare (e.g. `grouping`); the on-page renderer prepends
        // `./`, so mirror that to get a framework-prefixed doc URL.
        const feature =
            leaf.path != null
                ? `[${leaf.name}](${toAbsoluteUrl(urlWithPrefix({ url: `./${leaf.path}`, framework: framework as Framework }), siteRoot)})`
                : leaf.name;
        return [feature, `\`${leaf.moduleName}\``, leaf.isEnterprise ? 'Enterprise' : ''];
    });

    return markdownTable(['Feature', 'Module', 'Enterprise'], rows);
}

function collectLeaves(
    nodes: ModuleNode[],
    inheritedEnterprise: boolean,
    out: { name: string; moduleName: string; path?: string; isEnterprise: boolean }[]
): void {
    for (let i = 0, len = nodes.length; i < len; ++i) {
        const node = nodes[i];
        if (node.hideFromSelection) {
            continue;
        }
        const isEnterprise = Boolean(node.isEnterprise) || inheritedEnterprise;
        if (node.moduleName) {
            out.push({ name: node.name, moduleName: node.moduleName, path: node.path, isEnterprise });
        } else if (node.children) {
            collectLeaves(node.children, isEnterprise, out);
        }
    }
}
