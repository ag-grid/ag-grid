// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellRendererComp } from "./cellRenderers/iCellRenderer";
import { RowNode } from "../entities/rowNode";
/**
 * For Master Detail, it is required to keep components between expanding & collapsing parents.
 * For example a user expands row A (and shows a detail grid for this row), then when row A
 * is closed, we want to keep the detail grid, so next time row A is expanded the detail grid
 * is showed with it's context intact, eg if user sorted in the detail grid, that sort should
 * still be applied after the detail grid is shown for the second time.
 */
export declare class DetailRowCompCache {
    private gridOptionsWrapper;
    private cacheItems;
    private maxCacheSize;
    private active;
    private postConstruct;
    addOrDestroy(rowNode: RowNode, pinned: string, comp: ICellRendererComp): void;
    private getCacheItem;
    private stampCacheItem;
    private destroyFullWidthRow;
    private purgeCache;
    get(rowNode: RowNode, pinned: string): ICellRendererComp;
    destroy(): void;
}
