const fs = require('fs');
const { ComponentUtil } = require("@ag-grid-community/core");

function extractPropertyKeys(filePath) {
    const fileContents = fs.readFileSync(filePath);
    const testConfig = JSON.parse(fileContents);

    const propKeys = Object.entries(testConfig).filter(([k, v]) => {
        return !v.description?.includes('deprecated');
    }).map(([k, v]) => k);
    return propKeys;
}

function validateDocFile(name, autoFile, docFiles, manualExclusions = [], eventSrc = undefined) {
    console.log(`Validating ${name} Docs...`);
    const propKeys = extractPropertyKeys(autoFile);

    let docKeys = {};
    docFiles.forEach(docFile => {
        const src = fs.readFileSync(docFile);
        const srcProps = JSON.parse(src);
        Object.entries(srcProps).forEach(([k, v]) => {
            Object.keys(v).forEach(key => docKeys[key] = true)
        });
    });

    ([...manualExclusions]).forEach(key => {
        docKeys[key] = true
    })

    if (eventSrc) {
        const eventsSrc = fs.readFileSync(eventSrc);
        const eventsProps = JSON.parse(eventsSrc);

        Object.entries(eventsProps).forEach(([k, v]) => {
            Object.keys(v).forEach(key => {
                const eventName = 'on' + key[0].toUpperCase() + key.substr(1)
                docKeys[key] = true
                docKeys[eventName] = true
            })
        })
    }

    let missing = propKeys.filter(p => !docKeys[p] && !p.startsWith('__') && !p.startsWith('EVENT') && !p.startsWith('ID_'));
    if (missing.length > 0) {
        console.warn(`${name} Documentation Validated Failed`);
        console.warn(`Either mark the property as deprecated or add to the manual exclusion list in the documentation-api-validator.js file.`)
        console.warn(`Missing ${missing.length} ${name} properties from the documentation: ${missing.join()}`);
        throw new Error(`${name} Documentation Validated Failed`)
    } else {
        console.log(`${name} Documentation Validated Success`);
    }
}

// *** Don't remove these unused vars! ***
const [cmd, script, execFunc] = process.argv;

validateDocFile('GridOptions', './documentation/doc-pages/grid-api/grid-options.AUTO.json',
    [
        './documentation/doc-pages/grid-api/api.json',
        './documentation/doc-pages/grid-options/properties.json',
    ], [
    'onColumnRowGroupChangeRequest',
    'onColumnPivotChangeRequest',
    'onColumnValueChangeRequest',
    'onColumnAggFuncChangeRequest',
    'columnRowGroupChangeRequest',
    'columnPivotChangeRequest',
    'columnValueChangeRequest',
    'columnAggFuncChangeRequest',
    'deltaSort',
    'treeDataDisplayType',
    'functionsPassive',
    'enableGroupEdit',
    ...ComponentUtil.EXCLUDED_INTERNAL_EVENTS
], './documentation/doc-pages/grid-events/events.json');

validateDocFile('ColDef', './documentation/doc-pages/column-properties/column-options.AUTO.json', ['./documentation/doc-pages/column-properties/properties.json'], [
    'pivotKeys', 'pivotValueColumn', 'pivotTotalColumnIds'
]);
validateDocFile('ColumnApi', './documentation/doc-pages/column-api/column-api.AUTO.json', ['./documentation/doc-pages/column-api/api.json']);


// So many missing will need to get clarification on this.
// TODO 
//   - Grid Api,
//   - Column Object
//validateDocFile('GridApi', './documentation/doc-pages/grid-api/grid-api.AUTO.json', ['./documentation/doc-pages/grid-api/api.json']);
//validateDocFile('Column', './documentation/doc-pages/column-object/column.AUTO.json', ['./documentation/doc-pages/column-object/reference.json']);

validateDocFile('RowNode', './documentation/doc-pages/row-object/row-node.AUTO.json',
    [
        './documentation/doc-pages/row-object/resources/events.json',
        './documentation/doc-pages/row-object/resources/methods.json',
        './documentation/doc-pages/row-object/resources/reference.json'
    ]);
