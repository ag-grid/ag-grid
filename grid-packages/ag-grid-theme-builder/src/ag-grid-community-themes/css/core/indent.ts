// TODO remove this file once AG-10555 is implemented

const selectors = ['row-group-indent', 'column-select-indent', 'set-filter-indent'];

export default () => selectors.map(indentation).join('\n');

const indentation = (selector: string): string =>
  Array(100)
    .fill(0)
    .map((_, i) => indentationLevel(selector, i))
    .join('\n');

const indentationLevel = (selector: string, level: number): string => `.ag-${selector}-${level} {
    --ag-indentation-level: ${level};
}`;
