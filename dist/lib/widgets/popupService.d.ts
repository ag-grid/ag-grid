// Type definitions for ag-grid v9.0.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
export declare class PopupService {
    private gridCore;
    private gridOptionsWrapper;
    private getPopupParent();
    positionPopupForMenu(params: {
        eventSource: any;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderMouseEvent(params: {
        mouseEvent: MouseEvent | Touch;
        ePopup: HTMLElement;
    }): void;
    positionPopupUnderComponent(params: {
        eventSource: HTMLElement;
        ePopup: HTMLElement;
        minWidth?: number;
        nudgeX?: number;
        nudgeY?: number;
        keepWithinBounds?: boolean;
    }): void;
    positionPopupOverComponent(params: {
        eventSource: HTMLElement;
        ePopup: HTMLElement;
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
