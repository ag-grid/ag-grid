const replace = require('replace-in-file');
const fs = require('fs');
const { EOL } = require('os');
const ts = require('typescript');
const { ComponentUtil } = require("@ag-grid-community/core");
const { getFormatterForTS } = require('./../../scripts/formatAST');

const { formatNode, findNode, getJsDoc } = getFormatterForTS(ts);

function writeSortedLines(toWrite, result) {
    toWrite.sort((a, b) => {
        if (a.order < b.order) return -1;
        if (a.order > b.order) return 1;
        return 0
    });

    toWrite.forEach(p => {
        result += p.line;
    });
    // for readability
    result += EOL;
    return result;
}

function extractTypesFromNode(srcFile, node, { typeLookup, eventTypeLookup, publicEventLookup, docLookup }) {
    const kind = ts.SyntaxKind[node.kind];
    const name = node && node.name && node.name.escapedText;
    const returnType = node && node.type && node.type.getFullText();
    docLookup[name] = getJsDoc(node, true);
    if (kind == 'PropertySignature') {
        typeLookup[name] = returnType;
    } else if (kind == 'MethodSignature') {
        if (node.parameters && node.parameters.length > 0) {
            const methodParams = node.parameters.map(p => `${p.name.escapedText}: ${formatNode(p.type, srcFile)}`);
            typeLookup[name] = `(${methodParams.join(', ')}) => ${returnType}`;
        } else {
            typeLookup[name] = `() => ${returnType}`
        }

        if (publicEventLookup[name]) {
            // Events are assumed to have a single parameter
            if (node.parameters.length > 1) {
                throw new Error("Events with more than one parameter will cause issues to the frameworks!");
            }
            const typeName = formatNode(node.parameters[0].type, srcFile);
            eventTypeLookup[name] = typeName;
        }
    };
    ts.forEachChild(node, n => extractTypesFromNode(srcFile, n, { typeLookup, eventTypeLookup, publicEventLookup, docLookup }));
}


function generateAngularInputOutputs(compUtils, { typeLookup, eventTypeLookup, docLookup }) {
    const skippableProperties = ['gridOptions', 'reactUi', 'suppressReactUi'];

    let propsToWrite = [];
    const typeKeysOrder = Object.keys(typeLookup);

    compUtils.ALL_PROPERTIES.forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            const typeName = typeLookup[property];
            const inputType = getSafeType(typeName);
            let line = addDocLine(docLookup, property, '');
            let inputTypeWithGenerics = inputType;
            if (property == 'columnDefs') {
                // Use the Generic hint types for improved type checking by updating the columnDefs property
                inputTypeWithGenerics = inputType.replace('ColDef<TData>', 'TColDef');
            }
            line += `    @Input() public ${property}: ${inputTypeWithGenerics} = undefined;${EOL}`;
            const order = typeKeysOrder.findIndex(p => p === property);
            propsToWrite.push({ order, line });
        }
    });

    let result = writeSortedLines(propsToWrite, '');

    let eventsToWrite = [];
    const missingEventTypes = [];
    compUtils.PUBLIC_EVENTS.forEach((event) => {
        const onEvent = compUtils.getCallbackForEvent(event);
        const eventType = eventTypeLookup[onEvent];
        if (eventType) {
            const callbackName = ComponentUtil.getCallbackForEvent(event)
            let line = addDocLine(docLookup, callbackName, '');
            line += `    @Output() public ${event}: EventEmitter<${eventType}> = new EventEmitter<${eventType}>();${EOL}`;
            const order = typeKeysOrder.findIndex(p => p === callbackName);
            eventsToWrite.push({ order, line });
        } else {
            missingEventTypes.push(event);
        }
    });

    if (missingEventTypes.length > 0) {
        throw new Error(`The following events are missing type information: [${missingEventTypes.join()}]\n If this is a public event add it to the GridOptions interface. \n If a private event add it to ComponentUtil.EXCLUDED_INTERNAL_EVENTS.\n`)
    }

    result = writeSortedLines(eventsToWrite, result);
    result = addTypeCoercionHints(result, compUtils.BOOLEAN_PROPERTIES);

    const typesToImport = extractTypes({ eventTypeLookup, typeLookup }, skippableProperties);
    return { code: result, types: typesToImport };
}

function addTypeCoercionHints(result, boolProps) {
    result += `${EOL}    // Enable type coercion for boolean Inputs to support use like 'enableCharts' instead of forcing '[enableCharts]="true"' ${EOL}`;
    result += `    // https://angular.io/guide/template-typecheck#input-setter-coercion ${EOL}`;
    boolProps.forEach((property) => {
        result += `    static ngAcceptInputType_${property}: boolean | null | '';${EOL}`;
    });
    return result;
}

function getSafeType(typeName) {
    let inputType = 'any';
    if (typeName) {
        inputType = applyUndefinedUnionType(typeName);
    }
    return inputType;
}

/**
 * Ensure that we correctly apply the undefined as a separate union type for complex type
 *  e.g isExternalFilterPresent: (() => boolean) | undefined = undefined;
 *  Without the brackets this changes the return type!
 */
function applyUndefinedUnionType(typeName) {
    const trimmed = typeName.trim();
    if (trimmed === 'any') {
        // Don't union type with any
        return trimmed;
    }
    if (trimmed.includes('=>')) {
        return `(${trimmed}) | undefined`;
    }
    else {
        return `${trimmed} | undefined`;
    }
}

function addDocLine(docLookup, property, result) {
    const doc = docLookup[property];
    if (doc) {
        // Get comments to line up properly
        result += `    ${doc.replace(/\s\*/g, `     *`)}${EOL}`;
    }
    return result;
}

function parseFile(sourceFile) {
    const src = fs.readFileSync(sourceFile, 'utf8');
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

function extractTypes(context, propsToSkip = []) {
    let allTypes = [...Object.entries(context.typeLookup).filter(([k, v]) => !propsToSkip.includes(k)).map(([k, v]) => v), ...Object.values(context.eventTypeLookup)];

    let propertyTypes = [];
    const regex = new RegExp(/(?<!\w)(?:[A-Z]\w+)/, 'g')
    allTypes.forEach(tt => {
        const matches = tt.matchAll(regex);
        for (const match of matches) {
            propertyTypes.push(Array.from(match, m => m))
        }
    })
    let expandedTypes = propertyTypes.flatMap(m => m)

    const nonAgTypes = ['Partial', 'Document', 'HTMLElement', 'Function', 'TData']
    expandedTypes = [...new Set(expandedTypes)].filter(t => !nonAgTypes.includes(t)).sort();
    return expandedTypes;
}

function getGridPropertiesAndEventsJs() {
    const gridOpsFile = "../../community-modules/core/src/ts/entities/gridOptions.ts";
    const srcFile = parseFile(gridOpsFile);
    const gridOptionsNode = findNode('GridOptions', srcFile);

    // Apply @Output formatting to public events that are present in this lookup
    const publicEventLookup = {};
    ComponentUtil.PUBLIC_EVENTS.forEach(e => publicEventLookup[ComponentUtil.getCallbackForEvent(e)] = true);

    let context = {
        typeLookup: {},
        eventTypeLookup: {},
        docLookup: {},
        publicEventLookup
    }
    extractTypesFromNode(srcFile, gridOptionsNode, context);

    return generateAngularInputOutputs(ComponentUtil, context);
}

function getGridColumnPropertiesJs() {
    const { ColDefUtil } = require("@ag-grid-community/core");

    // colDef properties that dont make sense in an angular context (or are private)
    const skippableProperties = ['template',
        'templateUrl',
        'pivotKeys',
        'pivotValueColumn',
        'pivotTotalColumnIds',
        'templateUrl'
    ];

    const filename = "../../community-modules/core/src/ts/entities/colDef.ts";
    const srcFile = parseFile(filename);
    const abstractColDefNode = findNode('AbstractColDef', srcFile);
    const colGroupDefNode = findNode('ColGroupDef', srcFile);
    const colDefNode = findNode('ColDef', srcFile);


    let context = {
        typeLookup: {},
        eventTypeLookup: {},
        docLookup: {},
        publicEventLookup: {}
    }

    extractTypesFromNode(srcFile, abstractColDefNode, context);
    extractTypesFromNode(srcFile, colGroupDefNode, context);
    extractTypesFromNode(srcFile, colDefNode, context);

    function unique(value, index, self) {
        return self.indexOf(value) === index;
    }

    let propsToWrite = [];
    const typeKeysOrder = Object.keys(context.typeLookup);

    ColDefUtil.ALL_PROPERTIES.filter(unique).forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            const typeName = context.typeLookup[property];
            const inputType = getSafeType(typeName)

            let line = addDocLine(context.docLookup, property, '');
            // We don't initialise Column Inputs as this breaks the merging with defaultColDef options
            line += `    @Input() public ${property}: ${inputType};${EOL}`;
            const order = typeKeysOrder.findIndex(p => p === property);
            propsToWrite.push({ order, line });
        }
    });

    let result = writeSortedLines(propsToWrite, '');
    result = addTypeCoercionHints(result, ColDefUtil.BOOLEAN_PROPERTIES);
    const typesToImport = extractTypes(context, skippableProperties);

    return { code: result, types: typesToImport };
}

const updateGridProperties = (getGridPropertiesAndEvents) => {
    // extract the grid properties & events and add them to our angular grid component
    const { code: gridPropertiesAndEvents, types } = getGridPropertiesAndEvents();
    const optionsForGrid = {
        files: './projects/ag-grid-angular/src/lib/ag-grid-angular.component.ts',
        from: /(\/\/ @START@)[^]*(\/\/ @END@)/,
        to: `// @START@${EOL}${gridPropertiesAndEvents}    // @END@`,
    };

    const typesForGrid = {
        files: './projects/ag-grid-angular/src/lib/ag-grid-angular.component.ts',
        from: /(\/\/ @START_IMPORTS@)[^]*(\/\/ @END_IMPORTS@)/,
        to: `// @START_IMPORTS@${EOL}import {${EOL}    ${types.join(',' + EOL + '    ')}${EOL}} from "@ag-grid-community/core";${EOL}// @END_IMPORTS@`,
    };

    replace(typesForGrid);
    replace(optionsForGrid)
        .then(filesChecked => {
            const changes = filesChecked.filter(change => change.hasChanged);
            console.log(`Grid Properties: ${changes.length === 0 ? 'No Modified files' : 'Modified files: ' + changes.map(change => change.file).join(', ')}`);
        });
};

const updateColProperties = (getGridColumnProperties) => {
    // extract the grid column properties our angular grid column component    
    const { code: gridColumnProperties, types } = getGridColumnProperties();
    const optionsForGridColumn = {
        files: './projects/ag-grid-angular/src/lib/ag-grid-column.component.ts',
        from: /(\/\/ @START@)[^]*(\s.*\/\/ @END@)/,
        to: `// @START@${EOL}${gridColumnProperties}    // @END@`,
    };

    const typesForGrid = {
        files: './projects/ag-grid-angular/src/lib/ag-grid-column.component.ts',
        from: /(\/\/ @START_IMPORTS@)[^]*(\/\/ @END_IMPORTS@)/,
        to: `// @START_IMPORTS@${EOL}import {${EOL}    ${types.join(',' + EOL + '    ')}${EOL}} from "@ag-grid-community/core";${EOL}// @END_IMPORTS@`,
    };

    replace(typesForGrid);
    replace(optionsForGridColumn)
        .then(filesChecked => {
            const changes = filesChecked.filter(change => change.hasChanged);
            console.log(`Column Properties: ${changes.length === 0 ? 'No Modified files' : 'Modified files: ' + changes.map(change => change.file).join(', ')}`);
        });
};

updatePropertiesBuilt = () => {
    updateGridProperties(getGridPropertiesAndEventsJs);
    updateColProperties(getGridColumnPropertiesJs);
}

console.log(`--------------------------------------------------------------------------------`);
console.log(`Generate Angular Component Input / Outputs...`);
console.log('Using Typescript version: ', ts.version)

updatePropertiesBuilt()

console.log(`--------------------------------------------------------------------------------`);