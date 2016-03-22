// ag-grid-enterprise v4.0.7
import { IClipboardService } from "ag-grid/main";
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
    private logger;
    private init();
    pasteFromClipboard(): void;
    copyRangeDown(): void;
    private finishPasteFromClipboard(data);
    copyToClipboard(): void;
    private forEachRangeRow(callback);
    copySelectedRangeToClipboard(): void;
    private processRangeCell(rowNode, column, value);
    private getRowNode(gridRow);
    copySelectedRowsToClipboard(): void;
    private copyDataToClipboard(data);
    private executeOnTempElement(callbackNow, callbackAfter?);
    private dataToArray(strData);
}
