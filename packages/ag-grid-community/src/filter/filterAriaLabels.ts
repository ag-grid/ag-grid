import type { LocaleTextFunc } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';

export type ColumnFilterLabelId =
    | 'filterInput'
    | 'filterValue'
    | 'filterFromValue'
    | 'filterToValue'
    | 'filteringOperator'
    | 'filterMenuOpen'
    | 'columnFilter';

type ColumnFilterLabel = readonly [
    key: string,
    defaultValue: (columnName: string) => string,
    unnamedKey: string,
    unnamedDefaultValue: string,
];

const COLUMN_FILTER_LABELS: Record<ColumnFilterLabelId, ColumnFilterLabel> = {
    filterInput: ['ariaFilterInputForColumn', (name) => `${name} Filter Input`, 'ariaFilterInput', 'Filter Input'],
    filterValue: ['ariaFilterValueForColumn', (name) => `${name} Filter Value`, 'ariaFilterValue', 'Filter Value'],
    filterFromValue: [
        'ariaFilterFromValueForColumn',
        (name) => `${name} Filter from value`,
        'ariaFilterFromValue',
        'Filter from value',
    ],
    filterToValue: [
        'ariaFilterToValueForColumn',
        (name) => `${name} Filter to value`,
        'ariaFilterToValue',
        'Filter to value',
    ],
    filteringOperator: [
        'ariaFilteringOperatorForColumn',
        (name) => `${name} Filtering Operator`,
        'ariaFilteringOperator',
        'Filtering Operator',
    ],
    filterMenuOpen: [
        'ariaFilterMenuOpenForColumn',
        (name) => `Open ${name} Filter Menu`,
        'ariaFilterMenuOpen',
        'Open Filter Menu',
    ],
    columnFilter: [
        'ariaLabelColumnFilterForColumn',
        (name) => `${name} Column Filter`,
        'ariaLabelColumnFilter',
        'Column Filter',
    ],
};

/** A filter control's label naming its column; a column with no header name keeps the unnamed label. */
export function translateColumnFilterLabel(
    beans: BeanCollection,
    column: AgColumn,
    translate: LocaleTextFunc,
    label: ColumnFilterLabelId
): string {
    const [key, defaultValue, unnamedKey, unnamedDefaultValue] = COLUMN_FILTER_LABELS[label];
    const columnName = beans.colNames.getDisplayNameForColumn(column, 'header', true);
    return columnName
        ? translate(key, defaultValue(columnName), [columnName])
        : translate(unnamedKey, unnamedDefaultValue);
}
