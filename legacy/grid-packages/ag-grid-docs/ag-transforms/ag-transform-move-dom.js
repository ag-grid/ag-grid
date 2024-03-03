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

    
    let body = undefined;
    source
        .find(j.StringLiteral)                
        .filter((path) => {
            return path.value.value === 'DOMContentLoaded';
        }).forEach((path) => {
            const body1 = path.parent.value.arguments[1].body;
            
            body = body1;
        });
        console.log(body);
        
      const ops = source
    .find(j.VariableDeclaration)
    .filter((path) => path.value.declarations[0].id.name === 'gridOptions')       
    .insertAfter(body)
        ;
        console.log(ops);

   
        return source.toSource();
};
