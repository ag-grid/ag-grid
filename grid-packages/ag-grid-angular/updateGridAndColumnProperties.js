const replace = require('replace-in-file');
const typescriptSimple = require('typescript-simple');
const fs = require('fs');
const ts = require('typescript');

// satisfy ag-grid HTMLElement dependencies
HTMLElement = typeof HTMLElement === 'undefined' ? function () {
} : HTMLElement;
HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? function () {
} : HTMLSelectElement;
HTMLInputElement = typeof HTMLInputElement === 'undefined' ? function () {
} : HTMLInputElement;
HTMLButtonElement = typeof HTMLButtonElement === 'undefined' ? function () {
} : HTMLButtonElement;
MouseEvent = typeof MouseEvent === 'undefined' ? function () {
} : MouseEvent;

function getGridPropertiesAndEventsJs() {
    const {ComponentUtil} = require("ag-grid-community");

    let result = '';

    const skippableProperties = ['gridOptions'];

    let parsedSyntaxTreeResults;
    let typeLookup = { undefined: undefined };
    try {
        const filename = "../../community-modules/core/src/ts/entities/gridOptions.ts";
        const src = fs.readFileSync(filename, 'utf8');
        parsedSyntaxTreeResults = ts.createSourceFile('gridOps.ts', src, ts.ScriptTarget.Latest, true);


        function print(node, inGridOptions) {
            const kind = ts.SyntaxKind[node.kind];
            let internalGridOps = inGridOptions;
            if (inGridOptions || kind == 'InterfaceDeclaration' && node && node.name && node.name.escapedText == 'GridOptions') {
                const name = node && node.name && node.name.escapedText;
                if (kind == 'PropertySignature') {
                    const typeName = node && node.type && node.type.getFullText();
                    typeLookup[name] = typeName;
                } else if (kind == 'MethodSignature') {
                    const typeName = node && node.type && node.type.getFullText();
                    typeLookup[name] = typeName;

                    if (name.startsWith('on')) {
                        const typeName = node.parameters[0].type.typeName.escapedText;
                        typeLookup[name] = typeName;
                    }
                };
                internalGridOps = true;
            }
            ts.forEachChild(node, n => print(n, internalGridOps));
        }

        print(parsedSyntaxTreeResults, false);

    } catch (error) {
        const errorMsg = 'To troubleshoot paste snippet here: \'https://esprima.org/demo/parse.html\'';
        return `${error}\n\n${errorMsg}\n\n${this.snippet}`;
    }

    ComponentUtil.ALL_PROPERTIES.forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            result += `    @Input() public ${property} : ${typeLookup[property]} | undefined = undefined;\n`;
        }
    });

    // for readability
    result += '\n';

    ComponentUtil.EVENTS.filter(e => !ComponentUtil.INTERNAL_EVENTS.includes(e)).forEach((event) => {
        const onEvent = ComponentUtil.getCallbackForEvent(event);
        result += `    @Output() public ${event}: EventEmitter<${typeLookup[onEvent]}> = new EventEmitter<${typeLookup[onEvent]}>();\n`;
    });

    return result;
}

function getGridColumnPropertiesJs() {
    const {ColDefUtil} = require("ag-grid-community");

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
            result += `    @Input() public ${property}: any;\n`;
        }
    });

    return result;
}

function getJavascript(filename) {
    const src = fs.readFileSync(filename, 'utf8');
    return typescriptSimple(src, {module: 'commonjs'});
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
            result += `    @Input() public ${property} : any = undefined;\n`;
        }
    });

    // for readability
    result += '\n';

    events.forEach((event) => {
        result += `    @Output() public ${event}: EventEmitter<any> = new EventEmitter<any>();\n`;
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
            result += `    @Input() public ${property}: any;\n`;
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
        to: `// @START@\n${gridPropertiesAndEvents}    // @END@`,
    };

    replace(optionsForGrid)
        .then(filesChecked => {
            const changes = filesChecked.filter(change => change.hasChanged);
            console.log(`Grid Properties: ${changes.length === 0 ? 'No Modified files' : 'Modified files: ' + changes.map(changes => changes.file).join(', ')}`);
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
        to: `// @START@\n${gridColumnProperties}    // @END@`,
    };

    replace(optionsForGridColumn)
        .then(filesChecked => {
            const changes = filesChecked.filter(change => change.hasChanged);
            console.log(`Column Properties: ${changes.length === 0 ? 'No Modified files' : 'Modified files: ' + changes.map(changes => changes.file).join(', ')}`);
            resolve();
        })
        .catch(error => {
            console.error('Error occurred:', error);
            resolve();
        });
};

module.exports = {
    updatePropertiesBuilt: (cb) => {
        const gridPromise = new Promise((resolve) => {
            updateGridProperties(resolve, getGridPropertiesAndEventsJs);
        });
        const colPromise = new Promise((resolve) => {
            updateColProperties(resolve, getGridColumnPropertiesJs);
        });

        if (cb) {
            Promise.all([gridPromise, colPromise]).then(() => {
                cb();
            });
        }
    },
    updatePropertiesSrc: (cb) => {
        const gridPromise = new Promise((resolve) => {
            updateGridProperties(resolve, getGridPropertiesAndEventsTs);
        });
        const colPromise = new Promise((resolve) => {
            updateColProperties(resolve, getGridColumnPropertiesTs);
        });

        if (cb) {
            Promise.all([gridPromise, colPromise]).then(() => {
                cb();
            });
        }
    }
};
