// Type definitions for ag-grid-community v20.2.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridCore } from "../gridCore";
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
export declare class PopupService {
    private gridOptionsWrapper;
    private environment;
    private eventService;
    private activePopupElements;
    private gridCore;
    registerGridCore(gridCore: GridCore): void;
    private getDocument;
    private getPopupParent;
    positionPopupForMenu(params: {
        eventSource: HTMLElement;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderMouseEvent(params: {
        rowNode?: RowNode;
        column?: Column;
        type: string;
        mouseEvent: MouseEvent | Touch;
        nudgeX?: number;
        nudgeY?: number;
        ePopup: HTMLElement;
    }): void;
    private calculatePointerAlign;
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
        ePopup: HTMLElement | null;
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
    addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch | null): (event?: any) => void;
    addPopup(modal: boolean, eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch | null): (event?: any) => void;
    private isEventFromCurrentPopup;
    private isEventSameChainAsOriginalEvent;
}
