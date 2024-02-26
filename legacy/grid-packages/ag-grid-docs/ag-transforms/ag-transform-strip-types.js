const importPaths = new Set([
    '@ag-grid-community/core',
    '@ag-grid-enterprise/core',
    'ag-grid-community',
    './interfaces',
]);


/**
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 */
module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const source = j(fileInfo.source);

    // Remove AG Grid type imports based off example generations setup that put modules in different imports to the main interfaces
    const paths = source
        .find(j.ImportDeclaration)
        .filter((path) => importPaths.has(path.value.source.value) && !path.value.specifiers.some(s => s.local.name.includes('Module')))
        .remove()
        .toSource();
    

    source.find(j.TSTypeAliasDeclaration).remove().toSource();

    source.find(j.TSTypeParameterInstantiation).remove().toSource();
    // generic function params removed
    source.find(j.TSTypeParameterDeclaration).remove().toSource();
    // remove type parameters
    source.find(j.TSTypeAnnotation).remove().toSource();
    source.find(j.TSTypeReference).remove().toSource();

    source
        .find(j.TSNonNullExpression)
        .replaceWith((path) => {
            return path.node.expression;
        })
        .toSource();

    // document.querySelector<HTMLElement>('#myGrid') => document.querySelector('#myGrid')
    source
        .find(j.CallExpression)
        .forEach((path) => {
            path.value.typeParameters = null;
        })
        .toSource();

    source
        .find(j.JSXOpeningElement)
        .filter((path) => path.value.name.name === 'AgGridReact')
        .forEach((path) => {
            path.node.typeParameters = null;
        })
        .toSource();

    return source.toSource();
};
