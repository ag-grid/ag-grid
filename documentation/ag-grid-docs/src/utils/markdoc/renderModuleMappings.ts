import type { Framework } from '@ag-grid-types';
import { markdownTable } from '@ag-website-shared/markdoc/markdownTable';
import type { MarkdownFramework } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

export interface ModuleNode {
    name: string;
    moduleName?: string;
    path?: string;
    isEnterprise?: boolean;
    hideFromSelection?: boolean;
    children?: ModuleNode[];
}

interface ModuleLeaf {
    name: string;
    moduleName: string;
    path?: string;
    isEnterprise: boolean;
}

const MODULE_SELECTOR_URL = './modules/#selecting-modules';

/**
 * Build the `moduleMappings` tag as a flat GFM table of every module (leaf nodes of
 * the module tree): the feature name (linked to its docs when a `path` is set), the
 * module name, and whether it is an Enterprise module. Pure (no `astro:content`) so
 * it is unit-testable; the dispatcher loads the tree and calls this. The table is
 * preceded by a link to the interactive selector on the HTML page, which generates
 * the registration code for a chosen set of features.
 */
export function buildModuleMappingsTable(
    groups: ModuleNode[],
    framework: MarkdownFramework,
    siteRoot?: string
): string {
    const leaves: ModuleLeaf[] = [];
    collectLeaves(groups ?? [], false, leaves);
    if (leaves.length === 0) {
        return '';
    }

    const rows = leaves.map((leaf) => {
        // Module `path` values are bare (e.g. `grouping`); the on-page renderer prepends
        // `./`, so mirror that to get a framework-prefixed doc URL.
        const feature =
            leaf.path != null
                ? `[${leaf.name}](${toAbsoluteUrl(urlWithPrefix({ url: `./${leaf.path}`, framework: framework as Framework }), siteRoot)})`
                : leaf.name;
        return [feature, `\`${leaf.moduleName}\``, leaf.isEnterprise ? 'Enterprise' : ''];
    });

    const selectorUrl = toAbsoluteUrl(
        urlWithPrefix({ url: MODULE_SELECTOR_URL, framework: framework as Framework }),
        siteRoot
    );
    const lead = `[Select modules interactively](${selectorUrl}) to generate the registration code, or work from the full module list below.`;

    return [lead, markdownTable(['Feature', 'Module', 'Enterprise'], rows)].join('\n\n');
}

function collectLeaves(nodes: ModuleNode[], inheritedEnterprise: boolean, out: ModuleLeaf[]): void {
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
