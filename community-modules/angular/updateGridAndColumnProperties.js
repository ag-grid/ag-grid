const replace = require('replace-in-file');
const typescriptSimple = require('typescript-simple');
const fs = require('fs');
const { EOL } = require('os');
const ts = require('typescript');

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


function findGridOptionsNode(node) {
    const kind = ts.SyntaxKind[node.kind];

    if (kind == 'InterfaceDeclaration' && node && node.name && node.name.escapedText == 'GridOptions') {
        return node;
    }
    let gridOptionsNode = undefined;
    ts.forEachChild(node, n => {
        if (!gridOptionsNode) {
            gridOptionsNode = findGridOptionsNode(n);
        }
    });

    return gridOptionsNode;
}


function getGridPropertiesAndEventsJs() {
    const { ComponentUtil } = require("@ag-grid-community/core");

    let result = '';

    const skippableProperties = ['gridOptions'];

    let parsedSyntaxTreeResults;
    let typeLookup = {};
    let eventTypeLookup = {};
    const filename = "../../community-modules/core/src/ts/entities/gridOptions.ts";
    const src = fs.readFileSync(filename, 'utf8');
    parsedSyntaxTreeResults = ts.createSourceFile('gridOps.ts', src, ts.ScriptTarget.Latest, true);

    const gridOptionsNode = findGridOptionsNode(parsedSyntaxTreeResults);

    if (!gridOptionsNode) {
        throw "Unable to locate GridOptions interface in AST."
    }

    const publicEventLookup = {};
    ComponentUtil.PUBLIC_EVENTS.forEach(e => publicEventLookup[ComponentUtil.getCallbackForEvent(e)] = true);


    function extractTypesFromGridOptions(node) {
        const kind = ts.SyntaxKind[node.kind];
        const name = node && node.name && node.name.escapedText;
        const returnType = node && node.type && node.type.getFullText();
        if (kind == 'PropertySignature') {
            typeLookup[name] = returnType;
        } else if (kind == 'MethodSignature') {
            const getParamType = (typeNode) => {
                switch (ts.SyntaxKind[typeNode.kind]) {
                    case 'ArrayType':
                        return typeNode.elementType.typeName.escapedText + '[]';
                    case 'AnyKeyword':
                        return 'any';
                    default:
                        return typeNode.typeName.escapedText;
                }
            }

            if (node.parameters && node.parameters.length > 0) {
                const methodParams = node.parameters.map(p => `${p.name.escapedText}: ${getParamType(p.type)}`);
                typeLookup[name] = `(${methodParams.join(', ')}) => ${returnType}`;
            } else {
                typeLookup[name] = `() => ${returnType}`
            }

            if (publicEventLookup[name]) {
                const typeName = node.parameters[0].type.typeName.escapedText;
                eventTypeLookup[name] = typeName;
            }
        };
        ts.forEachChild(node, n => extractTypesFromGridOptions(n));
    }

    extractTypesFromGridOptions(parsedSyntaxTreeResults);


    ComponentUtil.ALL_PROPERTIES.forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            const typeName = typeLookup[property];
            const inputType = typeName ? `${typeName.trim()} | undefined` : 'any'
            result += `    @Input() public ${property}: ${inputType} = undefined;${EOL}`;
        }
    });

    // for readability
    result += EOL;

    ComponentUtil.PUBLIC_EVENTS.forEach((event) => {
        const onEvent = ComponentUtil.getCallbackForEvent(event);
        result += `    @Output() public ${event}: EventEmitter<${eventTypeLookup[onEvent]}> = new EventEmitter<${eventTypeLookup[onEvent]}>();${EOL}`;
    });

    return result;
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

    let result = '';

    function unique(value, index, self) {
        return self.indexOf(value) === index;
    }

    ColDefUtil.ALL_PROPERTIES.filter(unique).forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            result += `    @Input() public ${property}: any;${EOL}`;
        }
    });

    return result;
}

function getJavascript(filename) {
    const src = fs.readFileSync(filename, 'utf8');
    return typescriptSimple(src, { module: 'commonjs' });
}

function getGridPropertiesAndEventsTs() {
    const eventsSrc = getJavascript('../../community-modules/core/src/ts/eventKeys.ts');
    const propertyKeysSrc = getJavascript('../../community-modules/core/src/ts/propertyKeys.ts');

    eval(eventsSrc);
    eval(propertyKeysSrc);

    const events = [];
    const keys = Object.keys(exports.Events);
    for (const key of keys) {
        events.push(exports.Events[key]);
    }

    let result = '';

    const skippableProperties = ['gridOptions'];

    exports.PropertyKeys.ALL_PROPERTIES.forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            result += `    @Input() public ${property}: any = undefined;${EOL}`;
        }
    });

    // for readability
    result += EOL;

    events.forEach((event) => {
        result += `    @Output() public ${event}: EventEmitter<any> = new EventEmitter<any>();${EOL}`;
    });

    return result;
}

function getGridColumnPropertiesTs() {
    const js = getJavascript('../../community-modules/core/src/ts/components/colDefUtil.ts');
    eval(js);

    // colDef properties that dont make sense in an angular context (or are private)
    const skippableProperties = ['template',
        'templateUrl',
        'pivotKeys',
        'pivotValueColumn',
        'pivotTotalColumnIds',
        'templateUrl'
    ];

    let result = '';

    function unique(value, index, self) {
        return self.indexOf(value) === index;
    }

    exports.ColDefUtil.ALL_PROPERTIES.filter(unique).forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            result += `    @Input() public ${property}: any;${EOL}`;
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
    },
    updatePropertiesSrc: (cb) => {
        const gridPromise = new Promise(resolve => updateGridProperties(resolve, getGridPropertiesAndEventsTs));
        const colPromise = new Promise(resolve => updateColProperties(resolve, getGridColumnPropertiesTs));

        if (cb) {
            Promise.all([gridPromise, colPromise]).then(() => cb());
        }
    }
};

// module.exports.updatePropertiesSrc = updatePropertiesSrc;
