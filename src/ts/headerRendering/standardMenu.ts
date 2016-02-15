import {Bean} from "../context/context";
import {IMenu} from "../interfaces/iMenu";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {Qualifier} from "../context/context";
import FilterManager from "../filter/filterManager";
import Column from "../entities/column";
import _ from '../utils';
import {ColumnController} from "../columnController/columnController";
import {Autowired} from "../context/context";
import PopupService from "../widgets/agPopupService";

@Bean('menuFactory')
export class StandardMenuFactory implements IMenuFactory {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('popupService') private popupService: PopupService;

    public showMenu(column: Column, eventSource: HTMLElement): void {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(column);

        var eMenu = document.createElement('div');
        _.addCssClass(eMenu, 'ag-menu');
        eMenu.appendChild(filterWrapper.gui);

        // need to show filter before positioning, as only after filter
        // is visible can we find out what the width of it is
        var hidePopup = this.popupService.addAsModalPopup(eMenu, true);
        this.popupService.positionPopup({eventSource: eventSource, ePopup: eMenu, keepWithinBounds: true});

        if (filterWrapper.filter.afterGuiAttached) {
            var params = {
                hidePopup: hidePopup,
                eventSource: eventSource
            };
            filterWrapper.filter.afterGuiAttached(params);
        }
    }

}
