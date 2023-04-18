import { GridOptions } from 'ag-grid-community';
import { AG_DND_GHOST_SELECTOR } from '../constants';
import { destoryAllCharts } from './destroyAllCharts';
import { clearAllSingleCellSelections } from './singleCell';

interface Params {
    gridOptions: GridOptions;
    scrollRow?: number;
    scrollColumn?: number;
}

export function resetGrid({ gridOptions, scrollRow, scrollColumn }: Params) {
    gridOptions?.columnApi?.resetColumnState();
    gridOptions?.columnApi?.resetColumnGroupState();
    gridOptions?.columnApi?.setColumnsPinned([], null);
    if (gridOptions?.api) {
        gridOptions.api.setFilterModel(null);
        gridOptions.api.closeToolPanel();
        gridOptions.api.clearRangeSelection();
        destoryAllCharts(gridOptions.api);
    }
    document.querySelector(AG_DND_GHOST_SELECTOR)?.remove();
    clearAllSingleCellSelections();

    // Send escape to clear context menu
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    const rowCount = gridOptions.api?.getModel().getRowCount() || 0;
    if (rowCount > 0) {
        if (scrollColumn !== undefined) {
            const allColumns = gridOptions.columnApi!.getColumns();
            if (allColumns) {
                const column = allColumns[scrollColumn];
                if (column) {
                    gridOptions.api!.ensureColumnVisible(column);
                }
            }
        }
        if (scrollRow !== undefined) {
            gridOptions.api!.ensureIndexVisible(scrollRow);
        }
    }
}
