// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
export declare class PopupService {
    private gridCore;
    private gridOptionsWrapper;
    private getPopupParent();
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
        nudgeX?: number;
        nudgeY?: number;
        keepWithinBounds?: boolean;
    }): void;
    private callPostProcessPopup(ePopup, eventSource, mouseEvent, type, column, rowNode);
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
    private positionPopup(params);
    private keepYWithinBounds(params, y);
    private keepXWithinBounds(params, x);
    addAsModalPopup(eChild: any, closeOnEsc: boolean, closedCallback?: () => void): (event?: any) => void;
}
