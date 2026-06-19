import type { AgColumn, Column, RowNode } from 'ag-grid-community';
import { isRowNumberCol } from 'ag-grid-community';

import { rowIdToString } from '../../grid-test-utils';
import { valuesEqual } from '../grid-rows-helpers';
import type { GridRows } from '../gridRows';
import { getRowStateFlags, getRowTypePrefix } from './nodeInfo';

/** Serialises a value for diagram output. The default path uses `JSON.stringify` (keeping the
 *  established `"abc"` quoting for strings) but rewraps objects/arrays in single quotes when the
 *  JSON output contains embedded `"` characters — that avoids `\"` escapes in the snapshot
 *  template literal. */
export function serialiseValue(value: unknown): string {
    if (typeof value === 'bigint') {
        return JSON.stringify(`${value}n`);
    }
    if (typeof value === 'number') {
        if (value !== value) {
            return 'NaN';
        }
        if (value === Infinity) {
            return 'Infinity';
        }
        if (value === -Infinity) {
            return '-Infinity';
        }
    }
    const json = JSON.stringify(value);
    // STRING containing `"` characters → JSON-encoded form is `"...\"...\""`. Use the raw string
    // wrapped in single quotes instead, provided it has no single quote of its own.
    if (typeof value === 'string' && json.includes('\\"') && !value.includes("'")) {
        return `'${value}'`;
    }
    // OBJECT / ARRAY whose JSON form contains `\"` (an actual escape sequence — a string with
    // embedded `"` got JSON-encoded) → wrap the JSON in single quotes so the source template
    // literal stays readable. Plain `"` chars in JSON (object keys, value delimiters) don't
    // need wrapping — backtick template literals accept `"` unescaped.
    if (value !== null && typeof value === 'object' && json.includes('\\"') && !json.includes("'")) {
        return `'${json}'`;
    }
    return json;
}

/** Gets a cell value with optional formatting, returning the resolved display value. */
function getCellDisplayValue(
    gridRows: GridRows,
    row: RowNode,
    column: Column,
    from?: 'data' | 'batch' | 'edit'
): unknown {
    // For showValuesAs columns, mirror the cell: request the transformed displayed value.
    const transformValues = (column as AgColumn).showValuesAs != null;
    let value: unknown;
    try {
        value = gridRows.api.getCellValue({ rowNode: row, colKey: column, useFormatter: false, from, transformValues });
    } catch {
        return '<ERROR>';
    }
    if (!(gridRows.options.useFormatter ?? true)) {
        return value;
    }
    let formattedValue: unknown;
    try {
        formattedValue = gridRows.api.getCellValue({
            rowNode: row,
            colKey: column,
            useFormatter: true,
            from,
            transformValues,
        });
    } catch {
        return value;
    }
    if (value === undefined && !formattedValue) {
        return undefined;
    }
    if (!formattedValue && (value === null || value === undefined)) {
        return value;
    }
    return formattedValue === String(value) ? value : formattedValue;
}

/** Formats column values for a single row in the diagram. */
export function formatRowColumns(
    gridRows: GridRows,
    row: RowNode,
    columns: Column[] | null,
    isRootRowNode: boolean,
    printedFields?: Set<string>
): string {
    if (!columns) {
        return '';
    }
    let result = '';
    const checkEditState = gridRows.checkEditState;
    const checkBatchState = gridRows.checkBatchState;

    for (const column of columns) {
        const columnId = column.getColId();
        const isRowNumber = isRowNumberCol(column);
        if (isRootRowNode && isRowNumber) {
            continue;
        }

        const diagramColumnId = isRowNumber ? 'row-number' : columnId;

        if (checkEditState) {
            // Skip the data/edit/batch comparison for rows with no active edit. The grid calls
            // user-provided `valueGetter`s fresh for each `from` variant, so non-deterministic
            // getters (e.g. ones that allocate a new object per call) would otherwise compare
            // unequal by reference even when no edit is in progress.
            const rowHasEdit = gridRows.isRowEditing(row);
            if (!rowHasEdit) {
                const value = getCellDisplayValue(gridRows, row, column);
                if (value === undefined) {
                    continue;
                }
                result += ' ' + diagramColumnId + ':' + serialiseValue(value);
            } else {
                // In edit state mode, show column:[🖍️edit ][⏳batch ]data
                const dataValue = getCellDisplayValue(gridRows, row, column, 'data');
                const batchValue = checkBatchState ? getCellDisplayValue(gridRows, row, column, 'batch') : dataValue;
                const editValue = getCellDisplayValue(gridRows, row, column, 'edit');

                const batchDiffers = !valuesEqual(batchValue, dataValue);
                const editDiffers = !valuesEqual(editValue, batchDiffers ? batchValue : dataValue);

                // When edit or batch is in progress, print the cell even if default value is undefined
                const value = getCellDisplayValue(gridRows, row, column);
                if (value === undefined && !editDiffers && !batchDiffers) {
                    continue;
                }

                result += ' ' + diagramColumnId + ':';
                if (editDiffers) {
                    result += '🖍️' + serialiseValue(editValue) + ' ';
                }
                if (batchDiffers) {
                    result += '⏳' + serialiseValue(batchValue) + ' ';
                }
                result += serialiseValue(dataValue !== undefined ? dataValue : value);
            }
        } else {
            // Use default resolution (no from param) to decide if column should be printed
            const value = getCellDisplayValue(gridRows, row, column);
            if (value === undefined) {
                continue;
            }
            result += ' ' + diagramColumnId + ':' + serialiseValue(value);
        }

        result += gridRows.rowSpanMarker(row, columnId);

        const colDef = column.getColDef();
        if (colDef.field) {
            printedFields?.add(colDef.field);
        }
    }

    return result;
}

/** Formats additional data properties for a row in the diagram. */
export function formatNodeDataProps(gridRows: GridRows, row: RowNode): string {
    const dataProps = gridRows.options.nodeDataProps;
    if (!dataProps?.length) {
        return '';
    }

    let result = '';
    for (const prop of dataProps) {
        const dataValue = (row.data as any)?.[prop];
        result += ` data.${prop}:${serialiseValue(dataValue ?? '')}`;
    }
    return result;
}

/** Builds the full diagram string for a single row. */
export function rowDiagram(gridRows: GridRows, row: RowNode, columns: Column[] | null): string {
    let result = getRowTypePrefix(gridRows, row);
    result += getRowStateFlags(gridRows, row);
    result += ' id:' + rowIdToString(row);

    const printedFields = new Set<string>();
    result += formatRowColumns(gridRows, row, columns, row === gridRows.rootRowNode, printedFields);
    result += formatNodeDataProps(gridRows, row);

    // For pinned rows, also print data fields that weren't already printed by columns
    if (row.rowPinned && row.data && typeof row.data === 'object') {
        for (const [key, value] of Object.entries(row.data)) {
            if (key !== 'id' && value !== undefined && value !== null && !printedFields.has(key)) {
                result += ` ${key}:${serialiseValue(value)}`;
            }
        }
    }

    return result + ' ';
}
