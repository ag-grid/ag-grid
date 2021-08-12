// Type definitions for @ag-grid-community/core v26.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { BeanStub } from "../../context/beanStub";
export declare class RowContainerEventsFeature extends BeanStub {
    private mouseEventService;
    private valueService;
    private contextMenuFactory;
    private ctrlsService;
    private navigationService;
    private focusService;
    private undoRedoService;
    private columnModel;
    private paginationProxy;
    private pinnedRowModel;
    private rangeService;
    private clipboardService;
    private element;
    constructor(element: HTMLElement);
    postConstruct(): void;
    private addKeyboardEvents;
    private addMouseListeners;
    private processMouseEvent;
    private mockContextMenuForIPad;
    private getRowForEvent;
    private handleContextMenuMouseEvent;
    private processKeyboardEvent;
    private processCellKeyboardEvent;
    private processFullWidthRowKeyboardEvent;
    private doGridOperations;
    private onCtrlAndA;
    private onCtrlAndC;
    private onCtrlAndV;
    private onCtrlAndD;
}
