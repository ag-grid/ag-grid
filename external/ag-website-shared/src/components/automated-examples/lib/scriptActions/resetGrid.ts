import type { GridApi } from 'ag-grid-community';

import { clearAllMenuOptionHighlights } from './clearAllMenuOptionHighlights';
import { clearAllRowHighlights } from './clearAllRowHighlights';
import { destoryAllCharts } from './destroyAllCharts';
import { removeDragAndDropHandles } from './removeDragAndDropHandles';
import { clearAllSingleCellSelections } from './singleCell';

interface Params {
    gridApi: GridApi;
    scrollRow?: number;
    scrollColumn?: number;
}

export function resetGrid({ gridApi, scrollRow, scrollColumn }: Params) {
    gridApi.resetColumnState();
    gridApi.resetColumnGroupState();
    gridApi.setColumnsPinned([], null);
    gridApi.setFilterModel(null);
    gridApi.closeToolPanel();
    gridApi.clearRangeSelection();
    destoryAllCharts(gridApi);
    removeDragAndDropHandles();
    clearAllSingleCellSelections();
    clearAllRowHighlights();
    clearAllMenuOptionHighlights();

    // Send escape to clear context menu
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    const rowCount = gridApi?.getDisplayedRowCount() || 0;
    if (rowCount > 0) {
        if (scrollColumn !== undefined) {
            const allColumns = gridApi!.getColumns();
            if (allColumns) {
                const column = allColumns[scrollColumn];
                if (column) {
                    gridApi!.ensureColumnVisible(column);
                }
            }
        }
        if (scrollRow !== undefined) {
            gridApi!.ensureIndexVisible(scrollRow);
        }
    }
}
