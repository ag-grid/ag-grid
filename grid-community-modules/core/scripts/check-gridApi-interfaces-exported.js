const fs = require('fs');

function checkGridOptionPropertyKeys() {
    const communityMainFilename = '../../grid-packages/ag-grid-enterprise/src/main.ts';
    const communityMainFileContents = fs.readFileSync(communityMainFilename, 'UTF-8');
    const gridApiContents = fs.readFileSync('./src/ts/gridApi.ts', 'UTF-8');

    const matches = [...communityMainFileContents.split('/* COMMUNITY_EXPORTS_START_DO_NOT_DELETE */')[1].matchAll(/(\w)*/g)];
    let mainExports = new Set();
    matches.forEach(m => {
        const split = m[0].split(/\W/).map(i => i.trim()).filter(i => !!i);
        split.forEach(s => {
            mainExports.add(s);
        });
    })

    let publicGridApiTypes = getPublicTypes(gridApiContents);
    let missingPropertyKeys = new Set();

    const excludedTypescriptExports = new Set(['Partial', 'Required', 'Readonly', 'Record', 'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'Uppercase', 'Lowercase', 'Capitalize', 'Uncapitalize', 'Parameters', 'ConstructorParameters', 'ReturnType', 'InstanceType']);

    publicGridApiTypes.forEach(m => {
        if (!mainExports.has(m) && !excludedTypescriptExports.has(m)) {
            missingPropertyKeys.add(m)
        }
    });

    if (missingPropertyKeys.size > 0) {
        console.error('check-grid-api-exports - GridApi are using types that are not publicly exported. Missing the following types:', [...missingPropertyKeys].join(', '));
        console.error('If running locally and you have added the missing type be sure to run build in "grid-community-modules/core", "grid-packages/ag-grid-community", "grid-packages/ag-grid-enterprise".')
        return 1;
    }
    console.log('check-grid-api-exports - GridApi Passed sanity check for missing types.')
    return 0;
}

const result = checkGridOptionPropertyKeys()
process.exit(result)

function getPublicTypes(fileContents) {
    const matchesPublicMethods = [...fileContents.matchAll(/public (\w*)\((.*)\)(:?) (\w*)/g)];
    let publicTypes = [];
    const toIgnore = [
    'TData', 'Blob', '', 'Document', 'Function', 'HTMLElement', 'KeyboardEvent', 'MouseEvent', 'Touch',
    // Some just missed by this script due to use of import * from ./events
    'AgEvent', 'ColumnEventType', 'SelectionEventSourceType', 'FilterChangedEventSourceType'];
    matchesPublicMethods.forEach(m => {
        const params = m[2].split(/\W/).map(i => i.trim());
        const returnType = m[4].split(/\W/).map(i => i.trim());
        publicTypes = [...publicTypes, ...params, ...returnType];
    });
    publicTypes = [...new Set(publicTypes.filter(i => !toIgnore.includes(i)).filter(s => s[0] === s[0].toUpperCase()))].sort();
    return publicTypes;
}
