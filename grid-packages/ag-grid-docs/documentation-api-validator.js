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

validateGridOptions = async () => {
    console.log('Validating GridOptions Docs...')

    const gridOptions = './documentation/doc-pages/grid-api/grid-options.AUTO.json'
    const propKeys = extractPropertyKeys(gridOptions);

    const docSections = [
        './documentation/doc-pages/grid-api/api.json',
        './documentation/doc-pages/grid-callbacks/callbacks.json',
        './documentation/doc-pages/grid-properties/properties.json',
    ];

    let docKeys = {};
    docSections.forEach(docSrc => {
        const src = fs.readFileSync(docSrc);
        const srcProps = JSON.parse(src);

        Object.entries(srcProps).forEach(([k, v]) => {
            Object.keys(v).forEach(key => docKeys[key] = true)
        })
    })

    const manualExclusions = [
        'columnRowGroupChangeRequest',
        'columnPivotChangeRequest',
        'columnValueChangeRequest',
        'columnAggFuncChangeRequest',
        'deltaSort',
        'treeDataDisplayType',
        'angularCompileRows',
        'angularCompileFilters',
        'functionsPassive',
        'enableGroupEdit',
    ];
    ([...manualExclusions, ...ComponentUtil.EXCLUDED_INTERNAL_EVENTS]).forEach(key => {
        const eventName = 'on' + key[0].toUpperCase() + key.substr(1)
        docKeys[key] = true
        docKeys[eventName] = true
    })

    const eventsSrc = fs.readFileSync('./documentation/doc-pages/grid-events/events.json');
    const eventsProps = JSON.parse(eventsSrc);

    Object.entries(eventsProps).forEach(([k, v]) => {
        Object.keys(v).forEach(key => {
            const eventName = 'on' + key[0].toUpperCase() + key.substr(1)
            docKeys[key] = true
            docKeys[eventName] = true
        })
    })


    let missing = propKeys.filter(p => !docKeys[p]);
    if (missing.length > 0) {
        console.warn("Grid Option Documentation Validated Failed");
        console.warn('Either mark the property as deprecated or add to the manual exclusion list in the documentation-api-validator.js file.')
        console.warn(`Missing ${missing.length} GridOption properties from the api documentation: ${missing.join()}`);
        throw new Error("Grid Option Documentation Validated Failed")
    } else {
        console.log("Grid Option Documentation Validated Success");
    }

}

function validateDocFile(name, autoFile, docFile, manualExclusions = []) {
    console.log(`Validating ${name} Docs...`);
    const propKeys = extractPropertyKeys(autoFile);

    let docKeys = {};
    const src = fs.readFileSync(docFile);
    const srcProps = JSON.parse(src);
    Object.entries(srcProps).forEach(([k, v]) => {
        Object.keys(v).forEach(key => docKeys[key] = true)
    });

    ([...manualExclusions]).forEach(key => {
        docKeys[key] = true
    })

    let missing = propKeys.filter(p => !docKeys[p]);
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

validateGridOptions();
validateDocFile('ColDef', './documentation/doc-pages/column-properties/column-options.AUTO.json', './documentation/doc-pages/column-properties/properties.json', [
    'pivotKeys', 'template', 'templateUrl', 'pivotValueColumn', 'pivotTotalColumnIds'
]);
validateDocFile('ColumnApi', './documentation/doc-pages/column-api/column-api.AUTO.json', './documentation/doc-pages/column-api/api.json');



// So many missing will need to get clarification on this.
// TODO 
//   - Row Object,
//   - Column Object
//validateDocFile('GridApi', './documentation/doc-pages/grid-api/grid-api.AUTO.json', './documentation/doc-pages/grid-api/api.json');
//validateDocFile('Column', './documentation/doc-pages/column-object/column.AUTO.json', './documentation/doc-pages/column-object/reference.json');

