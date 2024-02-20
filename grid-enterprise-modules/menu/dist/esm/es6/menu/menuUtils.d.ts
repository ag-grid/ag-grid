import { BeanStub, Column, HeaderPosition, CloseMenuEvent, PopupEventParams } from "@ag-grid-community/core";
export interface MenuRestoreFocusParams {
    column: Column | undefined;
    headerPosition: HeaderPosition | null;
    columnIndex: number;
    eventSource?: HTMLElement;
}
export declare class MenuUtils extends BeanStub {
    private readonly focusService;
    private readonly headerNavigationService;
    private readonly columnModel;
    restoreFocusOnClose(restoreFocusParams: MenuRestoreFocusParams, eComp: HTMLElement, e?: Event, restoreIfMouseEvent?: boolean): void;
    closePopupAndRestoreFocusOnSelect(hidePopupFunc: (popupParams?: PopupEventParams) => void, restoreFocusParams: MenuRestoreFocusParams, event?: CloseMenuEvent): void;
    onContextMenu(mouseEvent: MouseEvent | null | undefined, touchEvent: TouchEvent | null | undefined, showMenuCallback: (eventOrTouch: (MouseEvent | Touch)) => boolean): void;
    private focusHeaderCell;
    private blockMiddleClickScrollsIfNeeded;
}
