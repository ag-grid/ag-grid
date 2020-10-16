export const getSourcePath = (pageName, name, framework, importType, useFunctionalReact) => {
    if (framework === 'javascript') {
        framework = 'vanilla';
    } else if (framework === 'react' && useFunctionalReact) {
        framework = 'reactFunctional';
    }

    return `${pageName}/examples/${name}/_gen/${importType}/${framework}/`;
}