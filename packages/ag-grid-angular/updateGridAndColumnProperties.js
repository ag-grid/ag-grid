const replace = require('replace-in-file');
const typescript = require('typescript');
const typescriptSimple = require('typescript-simple');
const fs = require('fs');

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

    ComponentUtil.ALL_PROPERTIES.forEach((property) => {
        if (skippableProperties.indexOf(property) === -1) {
            result += `    @Input() public ${property} : any = undefined;\n`;
        }
    });

    // for readability
    result += '\n';

    ComponentUtil.EVENTS.forEach((event) => {
        result += `    @Output() public ${event}: EventEmitter<any> = new EventEmitter<any>();\n`;
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
    const eventsSrc = getJavascript('./node_modules/ag-grid-community/src/ts/eventKeys.ts');
    const propertyKeysSrc = getJavascript('./node_modules/ag-grid-community/src/ts/propertyKeys.ts');

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
    const js = getJavascript('./node_modules/ag-grid-community/src/ts/components/colDefUtil.ts');
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
        files: './src/agGridAngular.ts',
        from: /(\/\/ @START@)[^]*(\/\/ @END@)/,
        to: `// @START@\n${gridPropertiesAndEvents}    // @END@`,
    };

    replace(optionsForGrid)
        .then(changes => {
            console.log('Modified files:', changes.join(', '));
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
        files: './src/agGridColumn.ts',
        from: /(\/\/ @START@)[^]*(\s.*\/\/ @END@)/,
        to: `// @START@\n${gridColumnProperties}    // @END@`,
    };

    replace(optionsForGridColumn)
        .then(changes => {
            console.log('Modified files:', changes.join(', '));
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


module.exports.updatePropertiesSrc();
