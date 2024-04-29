import { Framework } from '@ag-grid-types';
import Markdoc from '@markdoc/markdoc';

export function getFirstParagraphText(markdocContent: string, currentFramework: Framework) {
    const root = Markdoc.parse(markdocContent);

    function findFirstParagraph(node) {
        if (node.type === 'paragraph') {
            return node;
        }

        if (node.type === 'tag') {
            if (node.tag === 'if') {
                if (node.annotations[0].value.parameters[0] === currentFramework) {
                    return findFirstParagraph(node.children[0]);
                }
            }

            if (node.tag === 'videoSection') {
                return findFirstParagraph(node.children[0]);
            }
        }

        return null;
    }

    function getDescription(node) {
        for (const child of node.children || []) {
            const found: boolean = findFirstParagraph(child);
            if (found) {
                return found;
            }
        }

        return null;
    }

    const firstParagraph = getDescription(root);

    if (!firstParagraph) {
        return;
    }

    return firstParagraph.children[0]?.children
        ?.map((node) => node.attributes?.content)
        .filter(Boolean)
        .join(' ');
}
