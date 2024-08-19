import type { GridApi } from 'ag-grid-community';

/**
 * Mapping from row id to row expanded value
 */
export type RowExpandedState = Record<string, boolean>;

export function createRowExpandedState(gridApi: GridApi) {
    const get = (): RowExpandedState => {
        const rowExpandedState = {};
        gridApi.forEachNode((node) => {
            rowExpandedState[node.id] = node.expanded;
        });
        return rowExpandedState;
    };

    const restore = (rowExpandedState: RowExpandedState) => {
        if (!rowExpandedState) {
            return;
        }
        gridApi.forEachNode((node) => {
            const openState = rowExpandedState[node.id];
            gridApi.setRowNodeExpanded(node, openState, false);
        });
    };

    return {
        get,
        restore,
    };
}
