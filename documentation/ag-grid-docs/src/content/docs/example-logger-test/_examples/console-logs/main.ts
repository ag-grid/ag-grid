import type { GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    rowData: [],
    columnDefs: [],
    onGridReady: () => {
        generateControls();
    },
};
// Create Grid, to simplify example generation
gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);

const CONSOLE_LOG_ARGS = [
    ['string'],
    [23],
    [null],
    [undefined],
    [NaN],
    [true, false],
    ['string', 23, null, undefined, true, false],
    [[]],
    [['string']],
    [['string', 23, null, undefined, true, false]],
    [[{ a: 'string', b: 23, c: null }, 23, null, undefined, true, false]],
    [[{}]],
    [{ a: 'string', b: 23, c: null }],
    [{ a: undefined, b: NaN, c: null }],
    [{ a: 'more', b: 'here', c: 'now', d: 'more' }],
    [
        'string',
        23,
        null,
        undefined,
        true,
        false,
        { a: 'more', b: 'here', c: 'now', d: 'more' },
        { a: 'more', b: 'here', c: 'now', d: 'more' },
        { a: 'more', b: 'here', c: 'now', d: 'more' },
        { a: 'more', b: 'here', c: 'now', d: 'more' },
        { a: 'more', b: 'here', c: 'now', d: 'more' },
        'asdfasdfsadfsadfds asdfasdfsadfsadfds asdfasdfsadfsadfds asdfasdfsadfsadfds asdfasdfsadfsadfds asdfasdfsadfsadfds asdfasdfsadfsadfds asdfasdfsadfsadfds',
    ],
];
const PRIMITIVE_TYPES = ['string', 'number', 'boolean', 'undefined', 'null', 'nan', 'symbol'];

function getType(value: any) {
    if (value === null) return 'null';
    if (Number.isNaN(value)) return 'nan';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'date';
    if (value instanceof RegExp) return 'regexp';
    if (value instanceof Map) return 'map';
    if (value instanceof Set) return 'set';
    if (value instanceof WeakMap) return 'weakmap';
    if (value instanceof WeakSet) return 'weakset';
    if (value instanceof Promise) return 'promise';
    if (value instanceof Error) return 'error';
    if (
        typeof value === 'object' &&
        value !== null &&
        value.constructor &&
        value.constructor.toString().startsWith('class ')
    )
        return 'classInstance';
    if (typeof value === 'object') return 'object';
    return typeof value;
}

function isPrimitiveType(value: any) {
    return PRIMITIVE_TYPES.includes(getType(value));
}

function stringify(value: any) {
    const valueType = getType(value);
    if (valueType === 'null') {
        return 'null';
    } else if (valueType === 'undefined') {
        return 'undefined';
    } else if (valueType === 'string') {
        return `"${value}"`;
    } else if (isPrimitiveType(value)) {
        return value.toString();
    } else {
        return JSON.stringify(value);
    }
}

function generateControls() {
    const controls = document.querySelector<HTMLElement>('#controls')!;

    const logControls = CONSOLE_LOG_ARGS.map((args) => {
        const container = document.createElement('div');
        const pre = document.createElement('pre');
        const button = document.createElement('button');

        button.textContent = 'Log';
        button.addEventListener('click', () => {
            console.log(...args);
        });
        container.appendChild(button);

        pre.textContent = `console.log(${args.map((arg) => stringify(arg)).join(', ')})`;
        container.appendChild(pre);

        return container;
    });

    logControls.forEach((control) => {
        controls.appendChild(control);
    });
}
