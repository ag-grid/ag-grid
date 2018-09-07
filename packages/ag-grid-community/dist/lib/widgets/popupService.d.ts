// Type definitions for ag-grid-community v19.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
export declare class PopupService {
    private gridCore;
    private gridOptionsWrapper;
    private environment;
    private activePopupElements;
    private getPopupParent;
    positionPopupForMenu(params: {
        eventSource: any;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderMouseEvent(params: {
        rowNode?: RowNode;
        column?: Column;
        type: string;
        mouseEvent: MouseEvent | Touch;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderComponent(params: {
        type: string;
        eventSource: HTMLElement;
        ePopup: HTMLElement;
        column?: Column;
        rowNode?: RowNode;
        minWidth?: number;
        minHeight?: number;
        nudgeX?: number;
        nudgeY?: number;
        keepWithinBounds?: boolean;
    }): void;
    private callPostProcessPopup;
    positionPopupOverComponent(params: {
        type: string;
        eventSource: HTMLElement;
        ePopup: HTMLElement;
        column: Column;
        rowNode: RowNode;
        minWidth?: number;
        nudgeX?: number;
        nudgeY?: number;
        keepWithinBounds?: boolean;
    }): void;
    private positionPopup;
    private keepYWithinBounds;
    private keepXWithinBounds;
    addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch): (event?: any) => void;
    private isEventFromCurrentPopup;
    private isEventSameChainAsOriginalEvent;
}
