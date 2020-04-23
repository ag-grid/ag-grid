import { Autowired, Bean } from '../context/context';
import { IMenuFactory } from '../interfaces/iMenuFactory';
import { FilterManager } from '../filter/filterManager';
import { Column } from '../entities/column';
import { PopupService } from '../widgets/popupService';
import { EventService } from '../eventService';
import { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import { _ } from '../utils';

@Bean('menuFactory')
export class StandardMenuFactory implements IMenuFactory {
    @Autowired('eventService') private eventService: EventService;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('popupService') private popupService: PopupService;

    private hidePopup: () => void;

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
        });
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
        });
    }

    public showPopup(column: Column, positionCallback: (eMenu: HTMLElement) => void): void {
        const filterWrapper = this.filterManager.getOrCreateFilterWrapper(column, 'COLUMN_MENU');
        const eMenu = document.createElement('div');

        _.addCssClass(eMenu, 'ag-menu');

        filterWrapper.guiPromise.then(gui => eMenu.appendChild(gui));

        let hidePopup: (() => void);

        const bodyScrollListener = (event: any) => {
            // if h scroll, popup is no longer over the column
            if (event.direction === 'horizontal') {
                hidePopup();
            }
        };

        this.eventService.addEventListener('bodyScroll', bodyScrollListener);

        const closedCallback = () => {
            this.eventService.removeEventListener('bodyScroll', bodyScrollListener);
            column.setMenuVisible(false, 'contextMenu');
        };

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        hidePopup = this.popupService.addAsModalPopup(eMenu, true, closedCallback);
        positionCallback(eMenu);

        filterWrapper.filterPromise.then(filter => {
            if (filter.afterGuiAttached) {
                const params: IAfterGuiAttachedParams = {
                    hidePopup
                };

                filter.afterGuiAttached(params);
            }
        });

        this.hidePopup = hidePopup;

        column.setMenuVisible(true, 'contextMenu');
    }

    public isMenuEnabled(column: Column): boolean {
        // for standard, we show menu if filter is enabled, and the menu is not suppressed
        return column.isFilterAllowed();
    }
}
