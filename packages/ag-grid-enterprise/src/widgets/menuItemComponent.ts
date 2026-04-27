import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    ComponentType,
    GridOptionsService,
    GridOptionsWithDefaults,
    IMenuActionParams,
    IMenuItemComp,
} from 'ag-grid-community';
import { AgPromise, _STOP_PROPAGATION_CALLBACKS, _addGridCommonParams, _warn } from 'ag-grid-community';

import type { AgMenuItemActivatedEvent, AgMenuItemCallbacks } from '../agStack/agMenuItemComponent';
import { AgMenuItemComponent } from '../agStack/agMenuItemComponent';
import { _preserveRangesWhile } from '../misc/enterpriseDomUtils';

const MenuItemComponentType: ComponentType<IMenuItemComp> = {
    name: 'menuItem',
    optionalMethods: ['setActive', 'select', 'setExpanded', 'configureDefaults'],
};

export interface MenuItemActivatedEvent
    extends AgMenuItemActivatedEvent<
        BeanCollection,
        GridOptionsWithDefaults,
        AgEventTypeParams,
        AgGridCommon<any, any>,
        GridOptionsService,
        AgComponentSelectorType,
        IMenuActionParams
    > {}

export const MENU_ITEM_CALLBACKS: AgMenuItemCallbacks<BeanCollection, IMenuActionParams, AgGridCommon<any, any>> = {
    getMenuItemComp: (beans, def, params) => {
        const compDetails = beans.userCompFactory.getCompDetails(
            def,
            MenuItemComponentType,
            'agMenuItem',
            _addGridCommonParams(beans.gos, params),
            true
        );
        return compDetails?.newAgStackInstance() ?? AgPromise.resolve();
    },
    getPostProcessPopupParams: ({ column, node }) => ({
        column,
        rowNode: node,
    }),
    preserveRangesWhile: _preserveRangesWhile,
    stopPropagationCallbacks: _STOP_PROPAGATION_CALLBACKS,
    warnNoItem: (menuItemOrString: string) => {
        _warn(228, { menuItemOrString });
    },
};

export class MenuItemComponent extends AgMenuItemComponent<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    IMenuActionParams
> {
    constructor() {
        super(MENU_ITEM_CALLBACKS);
    }
}
