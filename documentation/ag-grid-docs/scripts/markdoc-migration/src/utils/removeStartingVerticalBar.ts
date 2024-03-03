function removeLineVerticalBar(line: string) {
    // Strip out `|` prefix in code snippets
    const verticalBarPrefixRegex = /^\| ?(.*)/;
    const matches = line.match(verticalBarPrefixRegex);
    return matches ? matches[1] : line;
}

export function removeStartingVerticalBar(content: string) {
    const lineContent = content.split('\n');
    return lineContent.map(removeLineVerticalBar).join('\n');
}

export function childrenWithoutVerticalBar(children) {
    return children.map((replacementChild) => {
        if (replacementChild.type === 'paragraph') {
            replacementChild.children = replacementChild.children.map((childNode) => {
                if (childNode.type === 'text') {
                    childNode.value = removeStartingVerticalBar(childNode.value);
                }

                return childNode;
            });
        }

        return replacementChild;
    });
}
