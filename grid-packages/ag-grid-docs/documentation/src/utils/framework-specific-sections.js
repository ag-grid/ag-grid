const processChildren = (node, framework) => node.reduce((children, child) => {
    if (child.children) {
        child.children = processChildren(child.children, framework);
    }

    if (child.tagName === 'div' &&
        child.properties != null &&
        child.properties.className != null &&
        child.properties.className[0] === 'custom-block') {
        const blockCustomClass = child.properties.className[1];

        if (blockCustomClass.endsWith('-only-section')) {
            if (blockCustomClass.includes(framework) ||
                (blockCustomClass === 'frameworks-only-section' && framework !== 'javascript')) {
                return [...children, ...child.children[0].children];
            }

            return children;
        }
    }

    return [...children, child];
}, []);

/**
 * This will strip out sections from the AST that are not relevant to the specified framework.
 */
const processFrameworkSpecificSections = (ast, framework) => {
    return {
        ...ast,
        children: processChildren(ast.children, framework)
    };
};

module.exports = processFrameworkSpecificSections;