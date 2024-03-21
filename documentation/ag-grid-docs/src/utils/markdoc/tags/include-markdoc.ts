import Markdoc, { type Config, type Node, type RenderableTreeNode, type Schema } from '@markdoc/markdoc';
import { getContentRootFileUrl } from '@utils/pages';
import fs from 'fs';
import path from 'path';

/**
 * Markdoc code configuration key
 *
 * Copied from https://github.com/withastro/astro/blob/973a07ff251f78ea48db840ad8573cd9213f7105/packages/integrations/markdoc/src/utils.ts#L78C14-L78C35
 */
const MARKDOC_COMPONENT_CONFIG_KEY = Symbol.for('@astrojs/markdoc/component-config');

function getFilePath(file: string) {
    const contentRoot = getContentRootFileUrl();
    return path.join(contentRoot.pathname, 'docs', file);
}

/**
 * Check if a node has loaded and is renderable
 */
function componentHasLoaded(node: RenderableTreeNode) {
    // If the markdoc integration has not loaded the component, the node is a
    // markdoc component config object eg, if it has been loaded as a partial before
    // the page has loaded it
    return !(node?.name && node?.name[MARKDOC_COMPONENT_CONFIG_KEY]);
}

function printNonRenderableNode(nodes: RenderableTreeNode[]) {
    return nodes
        .map(({ name }) => {
            const { path, namedExport } = name;
            return `* ${path}${namedExport ? ` (${namedExport})` : ''}`;
        })
        .join('\n');
}

export const includeMarkdoc: Schema = {
    inline: false,
    selfClosing: true,
    attributes: {
        file: { type: String, render: false, required: true },
        variables: { type: Object, render: false },
    },
    transform(node: Node, config: Config) {
        const { file, variables } = node.attributes;
        const markdocFilePath = getFilePath(file);
        const fileExists = fs.existsSync(markdocFilePath);

        if (!fileExists) {
            throw new Error(`Markdoc file \`${file}\` not found. The 'file' must be in \`${markdocFilePath}\``);
        }

        const contents = fs.readFileSync(markdocFilePath).toString();
        const markdocAst = Markdoc.parse(contents);

        if (!markdocAst) return null;

        const scopedConfig = {
            ...config,
            variables: {
                ...config.variables,
                ...variables,
                ['$$includeMarkdoc:filename']: file,
            },
        };

        const findNonRenderableNodes = (
            node: RenderableTreeNode | RenderableTreeNode[],
            nonRenderableNodes: RenderableTreeNode[] = []
        ) => {
            if (Array.isArray(node)) {
                node.forEach((n) => {
                    if (!componentHasLoaded(n)) {
                        nonRenderableNodes.push(n);
                    }
                    findNonRenderableNodes(n, nonRenderableNodes);
                });
            } else if (node?.children) {
                node.children = node.children
                    .map((child) => {
                        if (!componentHasLoaded(child)) {
                            nonRenderableNodes.push(child);
                            return;
                        }

                        findNonRenderableNodes(child, nonRenderableNodes);
                        return child;
                    })
                    .filter(Boolean);
            }

            return nonRenderableNodes;
        };

        const transformChildren = (part: Node) => {
            const transformedChildren = part.resolve(scopedConfig).transformChildren(scopedConfig);

            const nonRenderableNodes = findNonRenderableNodes(transformedChildren);
            if (nonRenderableNodes.length) {
                throw new Error(
                    `Custom Markdoc tags not loaded before including Markdoc: '${file}'. Custom Markdoc tag render references:\n\n${printNonRenderableNode(nonRenderableNodes)}`
                );
            }

            return transformedChildren;
        };

        return Array.isArray(markdocAst) ? markdocAst.flatMap(transformChildren) : transformChildren(markdocAst);
    },
};
