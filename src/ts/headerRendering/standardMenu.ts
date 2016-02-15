import {Bean} from "../context/context";
import {IMenu} from "../interfaces/iMenu";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {Qualifier} from "../context/context";
import FilterManager from "../filter/filterManager";
import Column from "../entities/column";
import {ICreateMenuResult} from "../interfaces/iMenuFactory";
import _ from '../utils';
import {ColumnController} from "../columnController/columnController";
import {Autowired} from "../context/context";

@Bean('menuFactory')
export class StandardMenuFactory implements IMenuFactory {

    @Autowired('filterManager') private filterManager: FilterManager;

    public createMenu(column: Column): ICreateMenuResult {
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(column);

        var afterFilterAttachedCallback: Function;
        if (filterWrapper.filter.afterGuiAttached) {
            afterFilterAttachedCallback = filterWrapper.filter.afterGuiAttached.bind(filterWrapper.filter);
        }

        var eMenu = document.createElement('div');
        _.addCssClass(eMenu, 'ag-menu');
        eMenu.appendChild(filterWrapper.gui);

        return {
            afterGuiAttached: afterFilterAttachedCallback,
            menuGui: eMenu
        };

    }

}
