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

    source
        .find(j.Identifier)
        .filter((path) => {
            if (path.value.name === 'api') {
                // don't replace api if it' params.api.method
                var chainedPath = path.parent.value.type == 'MemberExpression' && path.parent.parent.value.type == 'MemberExpression';
                return !chainedPath;
            }
            return false;
        }).forEach((path) => {
            path.value.name = 'gridApi';
        });
        
        //replaceWith(j.identifier('gridApi'));
   
        return source.toSource();
};
