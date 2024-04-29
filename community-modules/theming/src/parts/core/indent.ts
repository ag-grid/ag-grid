// TODO remove this file once AG-10555 is implemented

const selectors: [string, number][] = [
    ['.ag-row-group-indent-%', 50],
    ['.ag-column-select-indent-%', 10],
    ['.ag-set-filter-indent-%', 10],
    ['.ag-filter-toolpanel-group-level-%-header', 10],
];

export default () => selectors.map(([selector, levels]) => indentation(selector, levels)).join(' ');

const indentation = (selector: string, levels: number): string =>
    Array(levels)
        .fill(0)
        .map((_, i) => indentationLevel(selector, i))
        .join(' ');

const indentationLevel = (selector: string, level: number): string =>
    selector.replaceAll('%', String(level)) + ` { --ag-indentation-level: ${level}; }`;
