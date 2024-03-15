import Markdoc from '@markdoc/markdoc';

export function getFirstParagraphText(markdocContent: string) {
    const root = Markdoc.parse(markdocContent);

    const firstParagraph = root.children.find((node) => {
        return node.type === 'paragraph';
    });

    if (!firstParagraph) {
        return;
    }

    return firstParagraph.children[0]?.children
        ?.map((node) => {
            return node.attributes?.content;
        })
        .filter(Boolean)
        .join(' ');
}
