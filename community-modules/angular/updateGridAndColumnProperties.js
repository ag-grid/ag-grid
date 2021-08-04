const replace = require('replace-in-file');
const fs = require('fs');
const { EOL } = require('os');
const ts = require('typescript');
const { ComponentUtil } = require("@ag-grid-community/core");
const { getFormatterForTS, findNode } = require('./../../scripts/formatAST');

const formatNode = getFormatterForTS(ts);

function extractTypesFromNode(srcFile, node, typeLookup, eventTypeLookup, publicEventLookup) {
    const kind = ts.SyntaxKind[node.kind];
    const name = node && node.name && node.name.escapedText;
    const returnType = node && node.type && node.type.getFullText();
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
    ts.forEachChild(node, n => extractTypesFromNode(srcFile, n, typeLookup, eventTypeLookup, publicEventLookup));
}


function generateAngularInputOutputs(compUtils, typeLookup, eventTypeLookup) {
    let result = '';
    const skippableProperties = ['gridOptions'];

    compUtils.ALL_PROPERTIES.forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            const typeName = typeLookup[property];
            const inputType = typeName ? `${typeName.trim()} | undefined` : 'any'
            result += `    @Input() public ${property}: ${inputType} = undefined;${EOL}`;
        }
    });

    // for readability
    result += EOL;

    compUtils.PUBLIC_EVENTS.forEach((event) => {
        const onEvent = compUtils.getCallbackForEvent(event);
        result += `    @Output() public ${event}: EventEmitter<${eventTypeLookup[onEvent]}> = new EventEmitter<${eventTypeLookup[onEvent]}>();${EOL}`;
    });

    return result;
}

function parseFile(sourceFile) {
    const src = fs.readFileSync(sourceFile, 'utf8');
    return ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);
}

function getGridPropertiesAndEventsJs() {
    const gridOpsFile = "../../community-modules/core/src/ts/entities/gridOptions.ts";
    const srcFile = parseFile(gridOpsFile);
    const gridOptionsNode = findNode('GridOptions', srcFile);

    // Apply @Output formatting to public events that are present in this lookup
    const publicEventLookup = {};
    ComponentUtil.PUBLIC_EVENTS.forEach(e => publicEventLookup[ComponentUtil.getCallbackForEvent(e)] = true);

    let typeLookup = {};
    let eventTypeLookup = {};
    extractTypesFromNode(srcFile, gridOptionsNode, typeLookup, eventTypeLookup, publicEventLookup);

    return generateAngularInputOutputs(ComponentUtil, typeLookup, eventTypeLookup);
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


    let typeLookup = {};
    extractTypesFromNode(srcFile, abstractColDefNode, typeLookup, {}, {});
    extractTypesFromNode(srcFile, colGroupDefNode, typeLookup, {}, {});
    extractTypesFromNode(srcFile, colDefNode, typeLookup, {}, {});

    let result = '';

    function unique(value, index, self) {
        return self.indexOf(value) === index;
    }

    ColDefUtil.ALL_PROPERTIES.filter(unique).forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            const typeName = typeLookup[property];
            const inputType = typeName ? `${typeName.trim()} | undefined` : 'any'
            result += `    @Input() public ${property}: ${inputType} = undefined;${EOL}`;
        }
    });

    return result;
}

const updateGridProperties = (getGridPropertiesAndEvents) => {
    // extract the grid properties & events and add them to our angular grid component
    const gridPropertiesAndEvents = getGridPropertiesAndEvents();
    const optionsForGrid = {
        files: './projects/ag-grid-angular/src/lib/ag-grid-angular.component.ts',
        from: /(\/\/ @START@)[^]*(\/\/ @END@)/,
        to: `// @START@${EOL}${gridPropertiesAndEvents}    // @END@`,
    };

    replace(optionsForGrid)
        .then(filesChecked => {
            const changes = filesChecked.filter(change => change.hasChanged);
            console.log(`Grid Properties: ${changes.length === 0 ? 'No Modified files' : 'Modified files: ' + changes.map(change => change.file).join(', ')}`);
        });
};

const updateColProperties = (getGridColumnProperties) => {
    // extract the grid column properties our angular grid column component
    const gridColumnProperties = getGridColumnProperties();
    const optionsForGridColumn = {
        files: './projects/ag-grid-angular/src/lib/ag-grid-column.component.ts',
        from: /(\/\/ @START@)[^]*(\s.*\/\/ @END@)/,
        to: `// @START@${EOL}${gridColumnProperties}    // @END@`,
    };

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