const fs = require('fs');

function checkGridOptionPropertyKeys() {
    const communityMainFilename = '../../grid-packages/ag-grid-enterprise/src/main.ts';
    const communityMainFileContents = fs.readFileSync(communityMainFilename, 'UTF-8');
    const gridApiContents = fs.readFileSync('./src/ts/gridApi.ts', 'UTF-8');
    const columnApiContents = fs.readFileSync('./src/ts/columns/columnApi.ts', 'UTF-8');

    const matches = [...communityMainFileContents.split('/* COMMUNITY_EXPORTS_START_DO_NOT_DELETE */')[1].matchAll(/(\w)*/g)];
    let mainExports = [];
    matches.forEach(m => {
        const split = m[0].split(/\W/).map(i => i.trim()).filter(i => !!i);
        mainExports = [...mainExports, ...split]
    })

    let publicGridApiTypes = getPublicTypes(gridApiContents);
    let publicColumnApiTypes = getPublicTypes(columnApiContents);
    let missingPropertyKeys = new Set();

    [...publicGridApiTypes, ...publicColumnApiTypes].forEach(m => {
        if (!mainExports.includes(m)) {
            missingPropertyKeys.add(m)
        }
    })

    if (missingPropertyKeys.size > 0) {
        console.error('check-grid-api-exports - GridApi / ColumnApi are using types that are not publicly exported. Missing the following types:', [...missingPropertyKeys].join(', '))
        return 1;
    }
    return 0;
}

const result = checkGridOptionPropertyKeys()
process.exit(result)

function getPublicTypes(fileContents) {
    const matchesPublicMethods = [...fileContents.matchAll(/public (\w*)\((.*)\)(:?) (\w*)/g)];
    let publicTypes = [];
    const toIgnore = ['TData', 'Blob', '', 'Document', 'Function', 'HTMLElement', 'KeyboardEvent', 'MouseEvent', 'Touch', 'OverlayWrapperComponent', 'AgEvent'];
    matchesPublicMethods.forEach(m => {
        const params = m[2].split(/\W/).map(i => i.trim());
        const returnType = m[4].split(/\W/).map(i => i.trim());
        publicTypes = [...publicTypes, ...params, ...returnType];
    });
    publicTypes = [...new Set(publicTypes.filter(i => !toIgnore.includes(i)).filter(s => s[0] === s[0].toUpperCase()))].sort();
    return publicTypes;
}
