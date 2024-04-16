// TODO remove this file once AG-10555 is implemented

const selectors = [
    '.ag-row-group-indent-%',
    '.ag-column-select-indent-%',
    '.ag-set-filter-indent-%',
    '.ag-filter-toolpanel-group-level-%-header',
];

export default () => selectors.map(indentation).join('\n');

const indentation = (selector: string): string =>
    Array(100)
        .fill(0)
        .map((_, i) => indentationLevel(selector, i))
        .join('\n');

const indentationLevel = (selector: string, level: number): string =>
    selector.replaceAll('%', String(level)) + ` { --ag-indentation-level: ${level}; }`;
