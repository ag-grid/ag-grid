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

export const getFrameworkFiles = framework => {
    if (framework === 'javascript') { return []; }

    let files = ['systemjs.config.js'];

    if (framework === 'angular') {
        files.unshift('main.ts', 'systemjs-angular-loader.js');
    }

    return files;
};
