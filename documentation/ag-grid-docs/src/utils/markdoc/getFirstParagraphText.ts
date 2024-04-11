import Markdoc from '@markdoc/markdoc';

export function getFirstParagraphText(markdocContent: string) {
    const root = Markdoc.parse(markdocContent);

    function findFirstParagraph(node) {
        if (node.type === 'paragraph') {
            return node;
        }

        // Handle VideoSection
        for (let child of node.children || []) {
            const found: boolean = findFirstParagraph(child);
            if (found) {
                return found;
            }
        }

        return null;
    }

    const firstParagraph = findFirstParagraph(root);

    if (!firstParagraph) {
        return;
    }

    return firstParagraph.children[0]?.children
        ?.map((node) => node.attributes?.content)
        .filter(Boolean)
        .join(' ');
}
