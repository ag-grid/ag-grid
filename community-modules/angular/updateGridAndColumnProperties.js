const replace = require('replace-in-file');
const fs = require('fs');
const { EOL } = require('os');
const ts = require('typescript');
const { ComponentUtil } = require("@ag-grid-community/core");
const { getFormatterForTS } = require('./../../scripts/formatAST');

const formatNode = getFormatterForTS(ts);

// satisfy ag-grid HTMLElement dependencies
HTMLElement = typeof HTMLElement === 'undefined' ? function() {
} : HTMLElement;
HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? function() {
} : HTMLSelectElement;
HTMLInputElement = typeof HTMLInputElement === 'undefined' ? function() {
} : HTMLInputElement;
HTMLButtonElement = typeof HTMLButtonElement === 'undefined' ? function() {
} : HTMLButtonElement;
MouseEvent = typeof MouseEvent === 'undefined' ? function() {
} : MouseEvent;


function findInterfaceNode(interfaceName, sourceFile) {
    let parsedSyntaxTreeResults;
    const src = fs.readFileSync(sourceFile, 'utf8');
    parsedSyntaxTreeResults = ts.createSourceFile('tempFile.ts', src, ts.ScriptTarget.Latest, true);

    const interfaceNode = findInterfaceInNodeTree(parsedSyntaxTreeResults, interfaceName);

    if (!interfaceNode) {
        throw `Unable to locate interface '${interfaceName}' in AST parsed from: ${sourceFile}.`
    }

    return interfaceNode;
}


function findInterfaceInNodeTree(node, interfaceName) {
    const kind = ts.SyntaxKind[node.kind];

    if (kind == 'InterfaceDeclaration' && node && node.name && node.name.escapedText == interfaceName) {
        return node;
    }
    let interfaceNode = undefined;
    ts.forEachChild(node, n => {
        if (!interfaceNode) {
            interfaceNode = findInterfaceInNodeTree(n, interfaceName);
        }
    });

    return interfaceNode;
}

function extractTypesFromNode(node, typeLookup, eventTypeLookup, publicEventLookup) {
    const kind = ts.SyntaxKind[node.kind];
    const name = node && node.name && node.name.escapedText;
    const returnType = node && node.type && node.type.getFullText();
    if (kind == 'PropertySignature') {
        typeLookup[name] = returnType;
    } else if (kind == 'MethodSignature') {
        if (node.parameters && node.parameters.length > 0) {
            const methodParams = node.parameters.map(p => `${p.name.escapedText}: ${formatNode(p.type)}`);
            typeLookup[name] = `(${methodParams.join(', ')}) => ${returnType}`;
        } else {
            typeLookup[name] = `() => ${returnType}`
        }

        if (publicEventLookup[name]) {
            // Events are assumed to have a single parameter
            if (node.parameters.length > 1) {
                throw new Error("Events with more than one parameter will cause issues to the frameworks!");
            }
            const typeName = formatNode(node.parameters[0].type);
            eventTypeLookup[name] = typeName;
        }
    };
    ts.forEachChild(node, n => extractTypesFromNode(n, typeLookup, eventTypeLookup, publicEventLookup));
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

function getGridPropertiesAndEventsJs() {
    const filename = "../../community-modules/core/src/ts/entities/gridOptions.ts";
    const gridOptionsNode = findInterfaceNode('GridOptions', filename);

    // Apply @Output formatting to public events that are present in this lookup
    const publicEventLookup = {};
    ComponentUtil.PUBLIC_EVENTS.forEach(e => publicEventLookup[ComponentUtil.getCallbackForEvent(e)] = true);

    let typeLookup = {};
    let eventTypeLookup = {};
    extractTypesFromNode(gridOptionsNode, typeLookup, eventTypeLookup, publicEventLookup);

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
    const abstractColDefNode = findInterfaceNode('AbstractColDef', filename);
    const colGroupDefNode = findInterfaceNode('ColGroupDef', filename);
    const colDefNode = findInterfaceNode('ColDef', filename);


    let typeLookup = {};
    extractTypesFromNode(abstractColDefNode, typeLookup, {}, {});
    extractTypesFromNode(colGroupDefNode, typeLookup, {}, {});
    extractTypesFromNode(colDefNode, typeLookup, {}, {});

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

const updateGridProperties = (resolve, getGridPropertiesAndEvents) => {
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
            resolve();
        })
        .catch(error => {
            console.error('Error occurred:', error);
            resolve();
        });
};

const updateColProperties = (resolve, getGridColumnProperties) => {
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
            resolve();
        })
        .catch(error => {
            console.error('Error occurred:', error);
            resolve();
        });
};

module.exports = {
    updatePropertiesBuilt: (cb) => {
        const gridPromise = new Promise(resolve => updateGridProperties(resolve, getGridPropertiesAndEventsJs));
        const colPromise = new Promise(resolve => updateColProperties(resolve, getGridColumnPropertiesJs));

        if (cb) {
            Promise.all([gridPromise, colPromise]).then(() => cb());
        }
    }
};
