const processFrameworkSpecificSections = (ast, framework) => {
    return {
        ...ast,
        children: ast.children.reduce((children, child) => {
            if (child.tagName === 'div' &&
                child.properties != null &&
                child.properties.className != null &&
                child.properties.className[0] === 'custom-block') {
                const blockCustomClass = child.properties.className[1];

                if (blockCustomClass.endsWith('-only-section')) {
                    if (blockCustomClass === `${framework}-only-section`) {
                        return [...children, ...child.children[0].children];
                    } else {
                        return children;
                    }
                }
            }

            return [...children, child];
        }, [])
    };
};

module.exports = processFrameworkSpecificSections;