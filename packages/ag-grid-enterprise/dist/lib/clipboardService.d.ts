// ag-grid-enterprise v19.1.3
import { IClipboardService, Column } from "ag-grid-community";
export declare class ClipboardService implements IClipboardService {
    private csvCreator;
    private loggerFactory;
    private selectionController;
    private rangeController;
    private rowModel;
    private pinnedRowModel;
    private valueService;
    private focusedCellController;
    private rowRenderer;
    private columnController;
    private eventService;
    private cellNavigationService;
    private gridOptionsWrapper;
    private gridCore;
    private columnApi;
    private gridApi;
    private logger;
    private init;
    pasteFromClipboard(): void;
    private pasteToRange;
    private pasteToSingleCell;
    copyRangeDown(): void;
    private fireRowChanged;
    private multipleCellRange;
    private singleCellRange;
    private updateCellValue;
    copyToClipboard(includeHeaders?: boolean): void;
    private iterateActiveRanges;
    private iterateActiveRange;
    copySelectedRangeToClipboard(includeHeaders?: boolean): void;
    private copyFocusedCellToClipboard;
    private dispatchFlashCells;
    private userProcessCell;
    private userProcessHeader;
    private getRowNode;
    copySelectedRowsToClipboard(includeHeaders?: boolean, columnKeys?: (string | Column)[]): void;
    private copyDataToClipboard;
    private executeOnTempElement;
    private dataToArray;
    private rangeSize;
}
//# sourceMappingURL=clipboardService.d.ts.map