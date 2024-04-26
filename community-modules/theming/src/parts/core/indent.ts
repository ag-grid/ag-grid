// TODO remove this file once AG-10555 is implemented

const selectors: [string, number][] = [
    ['.ag-row-group-indent-%', 100],
    ['.ag-column-select-indent-%', 10],
    ['.ag-set-filter-indent-%', 10],
    ['.ag-filter-toolpanel-group-level-%-header', 10],
];

export default () => selectors.map(([selector, levels]) => indentation(selector, levels)).join('\n');

const indentation = (selector: string, levels: number): string =>
    Array(levels)
        .fill(0)
        .map((_, i) => indentationLevel(selector, i))
        .join('\n');

const indentationLevel = (selector: string, level: number): string =>
    selector.replaceAll('%', String(level)) + ` { --ag-indentation-level: ${level}; }`;
