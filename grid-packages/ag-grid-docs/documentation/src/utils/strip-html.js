const visit = require('unist-util-visit');

module.exports = stripHtml;

/**
 * Returns the text contents from a tree of HTML.
 */
function stripHtml(tree) {
    let fragments = [];

    const ast = {
        ...tree,
        children: removeElements(tree.children, ['pre'])
    };

    // don't change this to a lambda function, causes it to break!
    visit(ast, 'text', function(node) {
        const trimmedValue = node.value.trim();

        if (trimmedValue !== '') {
            fragments.push(trimmedValue);
        }
    });

    return fragments.join(' ');
}

/**
 * Removes tags with the specified names from the tree.
 */
function removeElements(node, tagsToRemove = []) {
    return node.reduce(function(children, child) {
        if (child.children) {
            child.children = removeElements(child.children, tagsToRemove);
        }

        return tagsToRemove.includes(child.tagName) ? children : [...children, child];
    }, []);
}
