import { GridOptions } from 'ag-grid-community';

/**
 * Mapping from row id to row expanded value
 */
export type RowExpandedState = Record<string, boolean>;

export function createRowExpandedState(gridOptions: GridOptions) {
    const get = (): RowExpandedState => {
        const rowExpandedState = {};
        gridOptions.api!.forEachNode((node) => {
            rowExpandedState[node.id] = node.expanded;
        });
        return rowExpandedState;
    };

    const restore = (rowExpandedState: RowExpandedState) => {
        if (!rowExpandedState) {
            return;
        }
        gridOptions.api!.forEachNode((node) => {
            const openState = rowExpandedState[node.id];
            gridOptions.api!.setRowNodeExpanded(node, openState, false);
        });
    };

    return {
        get,
        restore,
    };
}
