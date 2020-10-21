export const getInternalFramework = (framework, useFunctionalReact) => {
    if (framework === 'javascript') {
        return 'vanilla';
    } else if (framework === 'react' && useFunctionalReact) {
        return 'reactFunctional';
    }

    return framework;
};

export const getSourcePath = (pageName, name, internalFramework, importType) =>
    `${pageName}/examples/${name}/_gen/${importType}/${internalFramework}/`;

export const getAppLocation = (pageName, name, internalFramework, importType) =>
    `/static/examples/${pageName}/${name}/${importType}/${internalFramework}/`;