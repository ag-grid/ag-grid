// ag-grid-enterprise v8.0.0
import { ColDef, IClipboardService, Column } from "ag-grid/main";
export declare class ClipboardService implements IClipboardService {
    private csvCreator;
    private loggerFactory;
    private selectionController;
    private rangeController;
    private rowModel;
    private floatingRowModel;
    private valueService;
    private focusedCellController;
    private rowRenderer;
    private columnController;
    private eventService;
    private cellNavigationService;
    private gridOptionsWrapper;
    private gridCore;
    private logger;
    private init();
    pasteFromClipboard(): void;
    copyRangeDown(): void;
    private finishPasteFromClipboard(data);
    private multipleCellRange(clipboardGridData, currentRow, updatedRowNodes, columnsToPasteInto, cellsToFlash, updatedColumnIds);
    private singleCellRange(parsedData, updatedRowNodes, currentRow, cellsToFlash, updatedColumnIds);
    private updateCellValue(rowNode, column, value, currentRow, cellsToFlash, updatedColumnIds);
    copyToClipboard(includeHeaders?: boolean): void;
    private iterateActiveRanges(onlyFirst, rowCallback, columnCallback?);
    private iterateActiveRange(range, rowCallback, columnCallback?);
    copySelectedRangeToClipboard(includeHeaders?: boolean): void;
    private copyFocusedCellToClipboard();
    private dispatchFlashCells(cellsToFlash);
    private processRangeCell(rowNode, column, value, func);
    private getRowNode(gridRow);
    copySelectedRowsToClipboard(includeHeaders?: boolean, columnKeys?: (string | Column | ColDef)[]): void;
    private copyDataToClipboard(data);
    private executeOnTempElement(callbackNow, callbackAfter?);
    private dataToArray(strData);
}
