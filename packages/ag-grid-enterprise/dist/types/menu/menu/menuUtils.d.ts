import type { AgColumn, BeanCollection, HeaderPosition, NamedBean, PopupEventParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';
import type { CloseMenuEvent } from 'ag-grid-enterprise';
export interface MenuRestoreFocusParams {
    column: AgColumn | undefined;
    headerPosition: HeaderPosition | null;
    columnIndex: number;
    eventSource?: HTMLElement;
}
export declare class MenuUtils extends BeanStub implements NamedBean {
    beanName: "menuUtils";
    private focusService;
    private headerNavigationService;
    private visibleColsService;
    wireBeans(beans: BeanCollection): void;
    restoreFocusOnClose(restoreFocusParams: MenuRestoreFocusParams, eComp: HTMLElement, e?: Event, restoreIfMouseEvent?: boolean): void;
    closePopupAndRestoreFocusOnSelect(hidePopupFunc: (popupParams?: PopupEventParams) => void, restoreFocusParams: MenuRestoreFocusParams, event?: CloseMenuEvent): void;
    onContextMenu(mouseEvent: MouseEvent | null | undefined, touchEvent: TouchEvent | null | undefined, showMenuCallback: (eventOrTouch: MouseEvent | Touch) => boolean): void;
    private focusHeaderCell;
    private blockMiddleClickScrollsIfNeeded;
}
