// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { GridCore } from "../gridCore";
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
export declare class PopupService {
    private gridOptionsWrapper;
    private environment;
    private eventService;
    private gridCore;
    private popupList;
    registerGridCore(gridCore: GridCore): void;
    private getDocument;
    getPopupParent(): HTMLElement;
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
        alignSide?: 'left' | 'right';
        keepWithinBounds?: boolean;
    }): void;
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
    private callPostProcessPopup;
    positionPopup(params: {
        ePopup: HTMLElement | null;
        minWidth?: number;
        minHeight?: number;
        nudgeX?: number;
        nudgeY?: number;
        x: number;
        y: number;
        keepWithinBounds?: boolean;
    }): void;
    private keepYWithinBounds;
    private keepXWithinBounds;
    addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch | null): (event?: any) => void;
    addPopup(modal: boolean, eChild: any, closeOnEsc: boolean, closedCallback?: () => void, click?: MouseEvent | Touch | null, alwaysOnTop?: boolean): (event?: any) => void;
    private isEventFromCurrentPopup;
    private isEventSameChainAsOriginalEvent;
    private getWrapper;
    setAlwaysOnTop(ePopup: HTMLElement, alwaysOnTop?: boolean): void;
    bringPopupToFront(ePopup: HTMLElement): void;
}
