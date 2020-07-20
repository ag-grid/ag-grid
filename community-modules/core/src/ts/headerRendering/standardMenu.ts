import { Autowired, Bean } from '../context/context';
import { BeanStub } from "../context/beanStub";
import { IMenuFactory } from '../interfaces/iMenuFactory';
import { FilterManager } from '../filter/filterManager';
import { Column } from '../entities/column';
import { PopupService } from '../widgets/popupService';
import { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import { Constants } from '../constants';
import { FocusController } from '../focusController';
import { _ } from '../utils';

@Bean('menuFactory')
export class StandardMenuFactory extends BeanStub implements IMenuFactory {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('focusController') private focusController: FocusController;

    private hidePopup: () => void;
    private tabListener: () => null;

    public hideActiveMenu(): void {
        if (this.hidePopup) {
            this.hidePopup();
        }
    }

    public showMenuAfterMouseEvent(column: Column, mouseEvent: MouseEvent | Touch): void {
        this.showPopup(column, eMenu => {
            this.popupService.positionPopupUnderMouseEvent({
                column,
                type: 'columnMenu',
                mouseEvent,
                ePopup: eMenu
            });
        }, mouseEvent.target as HTMLElement);
    }

    public showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void {
        this.showPopup(column, eMenu => {
            this.popupService.positionPopupUnderComponent({
                type: 'columnMenu',
                eventSource,
                ePopup: eMenu,
                keepWithinBounds: true,
                column
            });
        }, eventSource);
    }

    public showPopup(column: Column, positionCallback: (eMenu: HTMLElement) => void, eventSource: HTMLElement): void {
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
        const eMenu = document.createElement('div');

        eMenu.setAttribute('role', 'presentation');
        _.addCssClass(eMenu, 'ag-menu');

        this.tabListener = this.addManagedListener(eMenu, 'keydown', (e) => this.trapFocusWithin(e, eMenu));

        filterWrapper.guiPromise.then(gui => eMenu.appendChild(gui));

        let hidePopup: (() => void);

        const bodyScrollListener = (event: any) => {
            // if h scroll, popup is no longer over the column
            if (event.direction === 'horizontal') {
                hidePopup();
            }
        };

        this.eventService.addEventListener('bodyScroll', bodyScrollListener);

        const closedCallback = (e: Event) => {
            this.eventService.removeEventListener('bodyScroll', bodyScrollListener);
            column.setMenuVisible(false, 'contextMenu');
            const isKeyboardEvent = e instanceof KeyboardEvent;

            if (this.tabListener) {
                this.tabListener = this.tabListener();
            }

            if (isKeyboardEvent && eventSource && _.isVisible(eventSource)) {
                const focusableEl = this.focusController.findTabbableParent(eventSource);

                if (focusableEl) { focusableEl.focus(); }
            }
        };

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        hidePopup = this.popupService.addAsModalPopup(eMenu, true, closedCallback);
        positionCallback(eMenu);

        filterWrapper.filterPromise.then(filter => {
            if (filter.afterGuiAttached) {
                filter.afterGuiAttached({ container: 'columnMenu', hidePopup });
            }
        });

        this.hidePopup = hidePopup;

        column.setMenuVisible(true, 'contextMenu');
    }

    private trapFocusWithin(e: KeyboardEvent, menu: HTMLElement) {
        if (e.keyCode !== Constants.KEY_TAB) { return; }

        if (this.focusController.findNextFocusableElement(menu, false, e.shiftKey)) { return; }

        e.preventDefault();

        if (e.shiftKey) {
            this.focusController.focusLastFocusableElement(menu);
        } else {
            this.focusController.focusFirstFocusableElement(menu);
        }
    }

    public isMenuEnabled(column: Column): boolean {
        // for standard, we show menu if filter is enabled, and the menu is not suppressed
        return column.isFilterAllowed();
    }
}
