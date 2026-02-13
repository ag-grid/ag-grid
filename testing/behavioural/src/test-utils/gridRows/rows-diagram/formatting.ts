import type { Column, RowNode } from 'ag-grid-community';
import { isRowNumberCol } from 'ag-grid-community';

import { rowIdToString } from '../../grid-test-utils';
import type { GridRows } from '../gridRows';
import { getRowStateFlags, getRowTypePrefix } from './nodeInfo';

/** Serialises a value for diagram output, handling bigint specially. */
export function serialiseValue(value: unknown): string {
    return typeof value === 'bigint' ? JSON.stringify(`${value}n`) : JSON.stringify(value);
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

    for (const column of columns) {
        const columnId = column.getColId();
        if (isRootRowNode && isRowNumberCol(columnId)) {
            continue;
        }

        const value = gridRows.api.getCellValue({ rowNode: row, colKey: column, useFormatter: false });
        let formattedValue = value;
        if (gridRows.options.useFormatter ?? true) {
            formattedValue = gridRows.api.getCellValue({
                rowNode: row,
                colKey: column,
                useFormatter: true,
            });
            if (formattedValue === String(value)) {
                formattedValue = value;
            }
        }

        const diagramColumnId = isRowNumberCol(columnId) ? 'row-number' : columnId;
        if (value !== undefined || formattedValue) {
            result += ' ' + diagramColumnId + ':' + serialiseValue(formattedValue || value);
            const colDef = column.getColDef();
            if (colDef.field) {
                printedFields?.add(colDef.field);
            }
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
