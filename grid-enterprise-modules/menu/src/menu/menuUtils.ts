import {
    Autowired,
    Bean,
    BeanStub,
    Column,
    ColumnModel,
    FocusService,
    HeaderNavigationService,
    HeaderPosition,
    MenuItemSelectedEvent,
    PopupEventParams,
    _
} from "@ag-grid-community/core";

@Bean('menuUtils')
export class MenuUtils extends BeanStub {
    @Autowired('focusService') private readonly focusService: FocusService;
    @Autowired('headerNavigationService') private readonly headerNavigationService: HeaderNavigationService;
    @Autowired('columnModel') private readonly columnModel: ColumnModel;

    public restoreFocusOnClose(
        column: Column,
        component: BeanStub,
        headerPosition: HeaderPosition | null,
        columnIndex: number,
        eventSource?: HTMLElement,
        e?: Event
    ): void {
        this.destroyBean(component);
        column?.setMenuVisible(false, 'contextMenu');

        const isKeyboardEvent = e instanceof KeyboardEvent;
        if (!isKeyboardEvent || !eventSource) { return; }

        const isColumnStillVisible = this.columnModel.getAllDisplayedColumns().some(col => col === column);

        if (isColumnStillVisible && _.isVisible(eventSource)) {
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

    public restoreFocusOnSelect(hidePopupFunc: (popupParams?: PopupEventParams) => void, event?: MenuItemSelectedEvent): void {
        let keyboardEvent: KeyboardEvent | undefined;

        if (event && event.event && event.event instanceof KeyboardEvent) {
            keyboardEvent = event.event;
        }

        hidePopupFunc(keyboardEvent && { keyboardEvent: keyboardEvent });

        // this method only gets called when the menu was closed by selection an option
        // in this case we highlight the cell that was previously highlighted
        const focusedCell = this.focusService.getFocusedCell();
        const eDocument = this.gridOptionsService.getDocument();

        if (eDocument.activeElement === eDocument.body && focusedCell) {
            const { rowIndex, rowPinned, column } = focusedCell;
            this.focusService.setFocusedCell({ rowIndex, column, rowPinned, forceBrowserFocus: true, preventScrollOnBrowserFocus: true });
        }
    }
}
