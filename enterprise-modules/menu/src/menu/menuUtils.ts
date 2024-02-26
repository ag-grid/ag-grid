import {
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnModel,
    FocusService,
    HeaderNavigationService,
    HeaderPosition,
    CloseMenuEvent,
    PopupEventParams,
    _
} from "@ag-grid-community/core";

export interface MenuRestoreFocusParams {
    column: Column | undefined;
    headerPosition: HeaderPosition | null;
    columnIndex: number;
    eventSource?: HTMLElement;
}

@Bean('menuUtils')
export class MenuUtils extends BeanStub {
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('headerNavigationService') private readonly headerNavigationService: HeaderNavigationService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    public restoreFocusOnClose(
        restoreFocusParams: MenuRestoreFocusParams,
        eComp:  HTMLElement,
        e?: Event,
        restoreIfMouseEvent?: boolean
    ): void {
        const { eventSource } = restoreFocusParams;
        const isKeyboardEvent = e instanceof KeyboardEvent;
        if ((!restoreIfMouseEvent && !isKeyboardEvent) || !eventSource) { return; }
        
        const eDocument = this.gridOptionsService.getDocument();
        if (!eComp.contains(eDocument.activeElement) && eDocument.activeElement !== eDocument.body) {
            // something else has focus, so don't return focus to the header
            return;
        }

        this.focusHeaderCell(restoreFocusParams);
    }

    public closePopupAndRestoreFocusOnSelect(
        hidePopupFunc: (popupParams?: PopupEventParams) => void,
        restoreFocusParams: MenuRestoreFocusParams,
        event?: CloseMenuEvent
    ): void {
        let keyboardEvent: KeyboardEvent | undefined;

        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }

        hidePopupFunc(keyboardEvent && { keyboardEvent });

        // this method only gets called when the menu was closed by selecting an option
        // in this case we focus the cell that was previously focused, otherwise the header
        const focusedCell = this.focusService.getFocusedCell();
        const eDocument = this.gridOptionsService.getDocument();

        if (eDocument.activeElement === eDocument.body) {
            if (focusedCell) {
                const { rowIndex, rowPinned, column } = focusedCell;
                this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
            } else {
                this.focusHeaderCell(restoreFocusParams);
            }
        }
    }

    public onContextMenu(
        mouseEvent: MouseEvent | null | undefined,
        touchEvent: TouchEvent | null | undefined,
        showMenuCallback: (eventOrTouch: (MouseEvent | Touch)
    ) => boolean): void {
        // to allow us to debug in chrome, we ignore the event if ctrl is pressed.
        // not everyone wants this, so first 'if' below allows to turn this hack off.
        if (!this.gridOptionsService.get('allowContextMenuWithControlKey')) {
            // then do the check
            if (mouseEvent && (mouseEvent.ctrlKey || mouseEvent.metaKey)) { return; }
        }

        // need to do this regardless of context menu showing or not, so doing
        // before the isSuppressContextMenu() check
        if (mouseEvent) {
            this.blockMiddleClickScrollsIfNeeded(mouseEvent);
        }

        if (this.gridOptionsService.get('suppressContextMenu')) { return; }

        const eventOrTouch: (MouseEvent | Touch) = mouseEvent ?? touchEvent!.touches[0];
        if (showMenuCallback(eventOrTouch)) {
            const event = mouseEvent ?? touchEvent;
            event!.preventDefault();
        }
    }

    private focusHeaderCell(restoreFocusParams: MenuRestoreFocusParams): void {
        const { column, columnIndex, headerPosition, eventSource } = restoreFocusParams;

        const isColumnStillVisible = this.columnModel.getAllDisplayedColumns().some(col => col === column);

        if (isColumnStillVisible && eventSource && _.isVisible(eventSource)) {
            const focusableEl = this.focusService.findTabbableParent(eventSource);
            if (focusableEl) {
                if (column) {
                    this.headerNavigationService.scrollToColumn(column);
                }
                focusableEl.focus();
            }
        }
        // if the focusEl is no longer in the DOM, we try to focus
        // the header that is closest to the previous header position
        else if (headerPosition && columnIndex !== -1) {
            const allColumns = this.columnModel.getAllDisplayedColumns();
            const columnToFocus = allColumns[columnIndex] || _.last(allColumns);

            if (columnToFocus) {
                this.focusService.focusHeaderPosition({
                    headerPosition: {
                        headerRowIndex: headerPosition.headerRowIndex,
                        column: columnToFocus
                    }
                });
            }
        }
    }

    private blockMiddleClickScrollsIfNeeded(mouseEvent: MouseEvent): void {
        // if we don't do this, then middle click will never result in a 'click' event, as 'mousedown'
        // will be consumed by the browser to mean 'scroll' (as you can scroll with the middle mouse
        // button in the browser). so this property allows the user to receive middle button clicks if
        // they want.
        const { gridOptionsService } = this;
        const { which } = mouseEvent;

        if (gridOptionsService.get('suppressMiddleClickScrolls') && which === 2) {
            mouseEvent.preventDefault();
        }
    }
}
