const replace = require('replace-in-file');

// satisfy ag-grid HTMLElement dependencies
HTMLElement = typeof HTMLElement === 'undefined' ? function () {} : HTMLElement;
HTMLSelectElement = typeof HTMLSelectElement === 'undefined' ? function () {} : HTMLSelectElement;
HTMLInputElement = typeof HTMLInputElement === 'undefined' ? function () {} : HTMLInputElement;
HTMLButtonElement = typeof HTMLButtonElement === 'undefined' ? function () {} : HTMLButtonElement;
MouseEvent = typeof MouseEvent === 'undefined' ? function () {} : MouseEvent;

function getGridPropertiesAndEvents() {
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

function getGridColumnProperties() {
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

// extract the grid properties & events and add them to our angular grid component
const gridPropertiesAndEvents = getGridPropertiesAndEvents();
const optionsForGrid = {
    files: './src/agGridNg2.ts',
    from: /(\/\/ @START@)[^]*(\/\/ @END@)/,
    to: `// @START@\n${gridPropertiesAndEvents}    // @END@`,
};

replace(optionsForGrid)
    .then(changes => {
        console.log('Modified files:', changes.join(', '));
    })
    .catch(error => {
        console.error('Error occurred:', error);
    });

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
    })
    .catch(error => {
        console.error('Error occurred:', error);
    });
