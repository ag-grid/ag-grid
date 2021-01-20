import { isObjectProperty } from "./snippetUtils";

// This function associates comments with the correct node as comments returned in a separate array by 'esprima'
export const decorateWithComments = tree => {
    // store comments with locations for easy lookup
    const commentsMap = tree.comments.reduce((acc, comment) => {
        acc[comment.loc.start.line] = comment.value;
        return acc;
    }, {});

    // decorate nodes with comments
    const parseTree = node => {
        if (Array.isArray(node)) {
            node.forEach(n => parseTree(n));
        } else if (isVarDeclaration(node)) {
            node.declarations.forEach(n => parseTree(n));
        } else {
            node.comment = commentsMap[node.loc.start.line - 1];
            if (isObjectProperty(node)) {
                parseTree(node.value.properties);
            }
        }
    }

    // simpler and faster to start here
    const root = tree.body[0].declarations[0].init.properties;

    parseTree(root);

    return root;
}

export const isVarDeclaration = node => node.type === 'VariableDeclaration' && Array.isArray(node.declarations);