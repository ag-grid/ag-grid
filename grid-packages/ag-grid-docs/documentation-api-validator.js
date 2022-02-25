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

validateColDefs = async () => {
    console.log('Validating ColDef Docs...')
    const colDefOptions = './documentation/doc-pages/column-properties/column-options.AUTO.json'
    const propKeys = extractPropertyKeys(colDefOptions);

    const docSections = [
        './documentation/doc-pages/column-properties/properties.json'
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
        'pivotKeys', 'template', 'templateUrl', 'pivotValueColumn', 'pivotTotalColumnIds'
    ];
    ([...manualExclusions]).forEach(key => {
        docKeys[key] = true
    })

    let missing = propKeys.filter(p => !docKeys[p]);
    if (missing.length > 0) {
        console.warn("ColDef Documentation Validated Failed");
        console.warn('Either mark the property as deprecated or add to the manual exclusion list in the documentation-api-validator.js file.')
        console.warn(`Missing ${missing.length} ColDef properties from the documentation: ${missing.join()}`);
        throw new Error("ColDef Documentation Validated Failed")
    } else {
        console.log("ColDef Documentation Validated Success");
    }
}

validateGridApi = async () => {
    console.log('Validating Grid Api Docs...')
    const apiFile = './documentation/doc-pages/grid-api/grid-api.AUTO.json'
    const propKeys = extractPropertyKeys(apiFile);

    const docSections = [
        './documentation/doc-pages/grid-api/api.json'
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
    ];
    ([...manualExclusions]).forEach(key => {
        docKeys[key] = true
    })

    let missing = propKeys.filter(p => !docKeys[p]);
    if (missing.length > 0) {
        console.warn("GridApi Documentation Validated Failed");
        console.warn('Either mark the property as deprecated or add to the manual exclusion list in the documentation-api-validator.js file.')
        console.warn(`Missing ${missing.length} GridApi properties from the documentation: ${missing.join()}`);
        throw new Error("GridApi Documentation Validated Failed")
    } else {
        console.log("GridApi Documentation Validated Success");
    }
}

// *** Don't remove these unused vars! ***
const [cmd, script, execFunc] = process.argv;

validateGridOptions();
//validateGridApi();
validateColDefs();
/* 
if (process.argv.length >= 3 && execFunc === 'watch') {
    this.watchValidateExampleTypes();
} else if (process.argv.length >= 3 && execFunc === 'validate') {
    this.validateExampleTypes();
} */