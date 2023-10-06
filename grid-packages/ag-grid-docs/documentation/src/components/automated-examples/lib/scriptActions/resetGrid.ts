import { GridOptions } from 'ag-grid-community';
import { clearAllMenuOptionHighlights } from './clearAllMenuOptionHighlights';
import { clearAllRowHighlights } from './clearAllRowHighlights';
import { destoryAllCharts } from './destroyAllCharts';
import { removeDragAndDropHandles } from './removeDragAndDropHandles';
import { clearAllSingleCellSelections } from './singleCell';

interface Params {
    gridOptions: GridOptions;
    scrollRow?: number;
    scrollColumn?: number;
}

export function resetGrid({ gridOptions, scrollRow, scrollColumn }: Params) {
    gridOptions?.api?.resetColumnState();
    gridOptions?.api?.resetColumnGroupState();
    gridOptions?.api?.setColumnsPinned([], null);
    if (gridOptions?.api) {
        gridOptions.api.setFilterModel(null);
        gridOptions.api.closeToolPanel();
        gridOptions.api.clearRangeSelection();
        destoryAllCharts(gridOptions.api);
    }
    removeDragAndDropHandles();
    clearAllSingleCellSelections();
    clearAllRowHighlights();
    clearAllMenuOptionHighlights();

    // Send escape to clear context menu
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    const rowCount = gridOptions.api?.getModel().getRowCount() || 0;
    if (rowCount > 0) {
        if (scrollColumn !== undefined) {
            const allColumns = gridOptions.api!.getColumns();
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
