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
    [{ c: 'string', b: 23, a: null }],
    [{ undefined: undefined, nan: NaN, null: null, infinity: Infinity, negativeInfinity: -Infinity }],
    [{ a: 'more', b: 'here', c: undefined, d: 'more' }],
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
const REPLACEMENT_TYPES_MAP: Record<string, any> = {
    undefined: undefined,
    nan: NaN,
    infinity: Infinity,
    negativeInfinity: -Infinity,
};
const REPLACEMENT_TYPES = Object.keys(REPLACEMENT_TYPES_MAP);
const MATCH_TYPE_REGEXP = /\[TYPE:([^\]]+)]/g;
const MATCH_TYPE_WITH_QUOTES_REGEXP = /"\[TYPE:([^\]]+)]"/g;
const getReplacementTypeValue = (typeValue: string) => `[TYPE:${typeValue}]`;
const getReplacementType = (typeValue: string) => {
    const matches = MATCH_TYPE_REGEXP.exec(typeValue);
    return matches ? matches[1] : undefined;
};

function getType(value: any) {
    if (value === null) return 'null';
    if (Number.isNaN(value)) return 'nan';
    if (Array.isArray(value)) return 'array';
    if (value === Infinity) return 'infinity';
    if (value === -Infinity) return 'negativeInfinity';
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

function updateWithReplacements(value: any, replacementTypes: string[]) {
    const valueType = getType(value);

    if (replacementTypes.includes(valueType)) {
        return getReplacementTypeValue(valueType);
    } else if (valueType === 'array') {
        return value.map((item) => updateWithReplacements(item, replacementTypes));
    } else if (valueType === 'object') {
        const obj = { ...value };
        for (const key in value) {
            const valueValueType = getType(value[key]);
            if (replacementTypes.includes(valueValueType)) {
                obj[key] = getReplacementTypeValue(valueValueType);
            } else {
                obj[key] = updateWithReplacements(value[key], replacementTypes);
            }
        }
        return obj;
    } else {
        return value;
    }
}

function replaceTypeString({ str, withQuotes }: { str: string; withQuotes?: boolean }) {
    const regex = withQuotes ? MATCH_TYPE_WITH_QUOTES_REGEXP : MATCH_TYPE_REGEXP;
    return str.replaceAll(regex, (_, typeValue) => {
        return REPLACEMENT_TYPES_MAP[typeValue];
    });
}

function stringify(value: any) {
    const valueType = getType(value);
    let output = '';
    if (valueType === 'null') {
        output = 'null';
    } else if (valueType === 'undefined') {
        output = 'undefined';
    } else if (valueType === 'string') {
        const replacementType = getReplacementType(value);
        if (replacementType && REPLACEMENT_TYPES.includes(replacementType)) {
            output = replaceTypeString({ str: value });
        } else {
            output = `"${value}"`;
        }
    } else if (isPrimitiveType(value)) {
        output = value.toString();
    } else {
        output = JSON.stringify(value);
        output = replaceTypeString({ str: output, withQuotes: true });
    }

    return output;
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

        pre.textContent = `console.log(${args.map((arg) => stringify(updateWithReplacements(arg, REPLACEMENT_TYPES))).join(', ')})`;
        container.appendChild(pre);

        return container;
    });

    logControls.forEach((control) => {
        controls.appendChild(control);
    });
}
