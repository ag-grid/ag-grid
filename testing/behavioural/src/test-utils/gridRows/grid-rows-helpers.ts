import type { GridApi, IRowNode, RowNode } from 'ag-grid-community';

import type { GridRows } from './gridRows';
import type { GridRowsOptions } from './gridRowsOptions';
import type { GridRowsErrors } from './rows-validation/gridRowsErrors';

/** Adds the diagram text to a vitest assertion error so it appears in test output. */
export function addDiagramToError(
    error: any,
    diagram: string | null | undefined,
    label: string | null | undefined
): void {
    if (typeof error !== 'object' || error === null) {
        return;
    }

    const diagramText = (label ? '\n⬢ ' + label : '') + (diagram ? '\n\n' + diagram : '');
    error.message = (error.message ?? '') + diagramText;

    if (typeof error.toJSON === 'function') {
        const oldToJSON = error.toJSON;
        Reflect.defineProperty(error, 'toJSON', {
            value: function (this: any, ...args: any[]) {
                const json = oldToJSON.call(this, ...args);
                if (typeof json === 'object' && json !== null && typeof json.diff === 'string') {
                    json.diff += diagramText;
                }
                return json;
            },
            configurable: true,
            writable: true,
            enumerable: false,
        });
    }
}

export interface CollectedRows<TData> {
    rowNodes: RowNode<TData>[];
    displayedRows: RowNode<TData>[];
    rootRowNodes: RowNode<TData>[];
    pinnedTopRows: RowNode<TData>[];
    pinnedBottomRows: RowNode<TData>[];
    detailGridRows: Map<IRowNode<TData> | GridApi, GridRows<any>>;
}

/** Collects all row nodes, displayed rows, root nodes, pinned rows, and detail grid rows from the API. */
export function collectGridRows<TData>(
    api: GridApi<TData>,
    label: string,
    options: GridRowsOptions,
    errors: GridRowsErrors<TData>,
    GridRowsCtor: new (
        api: GridApi<any>,
        label: string,
        options: GridRowsOptions,
        errors: GridRowsErrors<any>
    ) => GridRows<any>
): CollectedRows<TData> {
    const rowNodes: RowNode<TData>[] = [];
    const displayedRows: RowNode<TData>[] = [];
    const rootNodesSet = new Set<RowNode<TData>>();
    const detailGridRows = new Map<IRowNode<TData> | GridApi, GridRows<any>>();

    const trackRoot = (row: RowNode<TData>) => {
        const parent = row.parent;
        if (parent && !parent.parent) {
            rootNodesSet.add(parent);
        }
    };

    api.forEachNode((row: RowNode) => {
        rowNodes.push(row);
        trackRoot(row);
    });

    for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
        const row = api.getDisplayedRowAtIndex(i) as RowNode<TData> | undefined;
        if (!row) {
            continue;
        }
        displayedRows.push(row);
        trackRoot(row);
        if (!row.detail) {
            continue;
        }
        const detailApi = row.detailGridInfo?.api;
        if (!detailApi || detailGridRows.has(detailApi)) {
            continue;
        }
        const detailGridRow = new GridRowsCtor(
            detailApi,
            label,
            { ...options, forcedColumns: options.forcedColumns ?? true },
            errors
        );
        detailGridRows.set(row, detailGridRow);
        detailGridRows.set(detailApi, detailGridRow);
    }

    const hasPinned = api.isModuleRegistered('PinnedRowModule');
    return {
        rowNodes,
        displayedRows,
        rootRowNodes: Array.from(rootNodesSet),
        pinnedTopRows: hasPinned ? collectPinnedRows(api.getPinnedTopRowCount(), (i) => api.getPinnedTopRow(i)) : [],
        pinnedBottomRows: hasPinned
            ? collectPinnedRows(api.getPinnedBottomRowCount(), (i) => api.getPinnedBottomRow(i))
            : [],
        detailGridRows,
    };
}

function collectPinnedRows<TData>(count: number, getter: (i: number) => any): RowNode<TData>[] {
    const rows: RowNode<TData>[] = [];
    for (let i = 0; i < count; ++i) {
        const row = getter(i);
        if (row) {
            rows.push(row);
        }
    }
    return rows;
}
