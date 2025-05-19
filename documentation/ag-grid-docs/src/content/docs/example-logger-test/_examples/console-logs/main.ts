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

const FakeGrid = class {
    constructor() {}
};

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
    [window, document, new CSSStyleSheet(), new Event('click'), new FakeGrid()],
];
const PRIMITIVE_TYPES = ['string', 'number', 'boolean', 'undefined', 'null', 'nan', 'symbol'];
const REPLACEMENT_TYPES_MAP: Record<string, any> = {
    undefined: undefined,
    nan: NaN,
    infinity: Infinity,
    negativeInfinity: -Infinity,
};
const REPLACEMENT_TYPES = [
    'undefined',
    'nan',
    'infinity',
    'negativeInfinity',
    'classInstance',
    'event',
    'cssStylesheet',
    'element',
    'document',
    'window',
];
const getReplacementValue = (value: any) => {
    const valueType = getType(value);
    if (valueType === 'classInstance') {
        return value.constructor.name + 'Class {}';
    } else if (valueType === 'event') {
        return value.constructor.name + ' { type: ' + value.type + ' }';
    } else if (valueType === 'cssStylesheet') {
        return value.constructor.name + ' {}';
    } else if (valueType === 'element') {
        return 'Element { ' + value.localName + ' }';
    } else if (valueType === 'document') {
        return 'Document {}';
    } else if (valueType === 'window') {
        return 'Window {}';
    }

    return `[TYPE:${valueType}]`;
};

const MATCH_TYPE_REGEXP = /\[TYPE:([^\]]+)]/g;
const MATCH_TYPE_WITH_QUOTES_REGEXP = /"\[TYPE:([^\]]+)]"/g;
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
    if (value instanceof Event) return 'event';
    if (value instanceof Element) return 'element';
    if (value instanceof Document) return 'document';
    if (value instanceof Window) return 'window';
    if (value instanceof CSSStyleSheet || (typeof value === 'object' && value.constructor.name === 'CSSStyleSheet'))
        return 'cssStylesheet';
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

function updateWithReplacements(originalValue: any, replacementTypes: any) {
    const seen = new WeakSet();

    const updateWithReplacementsRecursively = (value: any) => {
        const valueType = getType(value);

        if (seen.has(value)) {
            if (replacementTypes.includes(valueType)) {
                return getReplacementValue(value);
            } else {
                return '[Circular]';
            }
        }

        if (replacementTypes.includes(valueType)) {
            return getReplacementValue(value);
        } else if (valueType === 'array') {
            return value.map((item: any) => updateWithReplacementsRecursively(item));
        } else if (valueType === 'object') {
            const obj = { ...value };

            seen.add(value);

            for (const key in value) {
                const objValue = value[key];
                const objValueType = getType(objValue);

                if (replacementTypes.includes(objValueType)) {
                    obj[key] = getReplacementValue(objValue);
                } else {
                    obj[key] = updateWithReplacementsRecursively(objValue);
                }
            }

            return obj;
        } else {
            return value;
        }
    };

    return updateWithReplacementsRecursively(originalValue);
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
