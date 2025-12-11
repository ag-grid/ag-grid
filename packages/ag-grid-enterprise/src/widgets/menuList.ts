import type {
    AgComponentSelectorType,
    AgEventTypeParams,
    AgGridCommon,
    BeanCollection,
    GridOptionsService,
    GridOptionsWithDefaults,
    IMenuActionParams,
    WithoutGridCommon,
} from 'ag-grid-community';

import { AgMenuList } from '../agStack/agMenuList';
import { MENU_ITEM_CALLBACKS } from './menuItemComponent';

export class MenuList extends AgMenuList<
    BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    AgComponentSelectorType,
    IMenuActionParams
> {
    constructor(
        level?: number,
        menuActionParams: WithoutGridCommon<IMenuActionParams> = {
            column: null,
            node: null,
            value: null,
        }
    ) {
        super(level, menuActionParams, MENU_ITEM_CALLBACKS);
    }
}
