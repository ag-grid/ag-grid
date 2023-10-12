const importPaths = new Set([
    '@ag-grid-community/core',
    '@ag-grid-enterprise/core',
    'ag-grid-enterprise',
    'ag-grid-community',
]);

/**
 * @param {import('jscodeshift').FileInfo} fileInfo
 * @param {import('jscodeshift').API} api
 */
module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const source = j(fileInfo.source);

    const paths = source
        .find(j.ImportSpecifier)
        .filter((path) => importPaths.has(path.parent.value.source.value))
        .filter((path) => {
            return path.value.imported.name === 'Grid';
        });

    paths.insertAfter(j.importSpecifier(j.identifier('createGrid')));
    paths.insertAfter(j.importSpecifier(j.identifier('GridApi')));
    paths.remove();

    const gridCreation = source
        .find(j.NewExpression)
        .filter((path) => path.value.callee.name === 'Grid')
        .replaceWith((path) => {
            return j.expressionStatement(
                j.assignmentExpression(
                    '=',
                    j.identifier('api'),
                    j.callExpression(j.identifier('createGrid'), path.value.arguments)
                )
            );
        })
        .toSource();

    // replace gridOptions.api. with api.
    const gridOptionsApi = source
        .find(j.MemberExpression)
        .filter((path) => path.value.object.name === 'gridOptions')
        .filter((path) => path.value.property.name === 'api')
        .replaceWith((path) => {
            return j.identifier('api');
        })
        .toSource();

    let tData = undefined;

    // define api above gridOptions if it doesn't exist
    let apiExists =
        source.find(j.VariableDeclaration).filter((path) => path.value.declarations[0].id.name === 'api').length > 0;

    if (!apiExists) {
        const gridOptions = source
            .find(j.VariableDeclaration)
            .filter((path) => path.value.declarations[0].id.name === 'gridOptions')
            .insertBefore((path) => {
                tData =
                    path.value.declarations[0].id.typeAnnotation?.typeAnnotation.typeParameters?.params[0].typeName
                        .name;

                const apiVar = j.variableDeclaration('let', [j.variableDeclarator(j.identifier('api'))]);
                return apiVar;
            });

        source
            .find(j.VariableDeclarator)
            .find(j.Identifier, { name: 'api' })
            // parent is variableDeclaratorlist
            .filter((path) => path.parent.parent.value.kind === 'let')
            // Add a typeAnnotation property to the node
            .forEach(
                (path) =>
                    (path.node.typeAnnotation = j.tsTypeAnnotation(
                        j.tsTypeReference(
                            j.identifier('GridApi'),
                            tData ? j.tsTypeParameterInstantiation([j.tsTypeReference(j.identifier(tData))]) : null
                        )
                    ))
            );
        return source.toSource();
    }
};
