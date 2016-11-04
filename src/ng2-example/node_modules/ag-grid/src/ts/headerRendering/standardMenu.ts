import {Bean, Autowired} from "../context/context";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {FilterManager} from "../filter/filterManager";
import {Column} from "../entities/column";
import {Utils as _} from "../utils";
import {PopupService} from "../widgets/popupService";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {IAfterFilterGuiAttachedParams} from "../interfaces/iFilter";

@Bean('menuFactory')
export class StandardMenuFactory implements IMenuFactory {

    @Autowired('filterManager')
    private filterManager:FilterManager;
    @Autowired('popupService')
    private popupService:PopupService;
    @Autowired('gridOptionsWrapper')
    private gridOptionsWrapper:GridOptionsWrapper;

    public showMenuAfterMouseEvent(column:Column, mouseEvent:MouseEvent|Touch): void {
        this.showPopup(column, (eMenu: HTMLElement) => {
            this.popupService.positionPopupUnderMouseEvent({
                mouseEvent: mouseEvent,
                ePopup: eMenu
            });
        });
    }

    public showMenuAfterButtonClick(column: Column, eventSource: HTMLElement): void {
        this.showPopup(column, (eMenu: HTMLElement) => {
            this.popupService.positionPopupUnderComponent({eventSource: eventSource, ePopup: eMenu, keepWithinBounds: true});
        });
    }

    public showPopup(column: Column,  positionCallback: (eMenu: HTMLElement)=>void): void {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(column);

        var eMenu = document.createElement('div');
        _.addCssClass(eMenu, 'ag-menu');
        eMenu.appendChild(filterWrapper.gui);

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenu, true);
        positionCallback(eMenu);

        if (filterWrapper.filter.afterGuiAttached) {
            var params: IAfterFilterGuiAttachedParams = {
                hidePopup: hidePopup
            };
            filterWrapper.filter.afterGuiAttached(params);
        }
    }

    public isMenuEnabled(column: Column): boolean {
        // for standard, we show menu if filter is enabled, and he menu is not suppressed
        return this.gridOptionsWrapper.isEnableFilter() && column.isFilterAllowed();
    }

}
