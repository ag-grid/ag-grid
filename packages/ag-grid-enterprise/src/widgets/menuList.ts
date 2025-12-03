import type {
    AgEventTypeParams,
    AgGridCommon,
    GridOptionsService,
    GridOptionsWithDefaults,
    IMenuActionParams,
    WithoutGridCommon,
    _AgComponentSelectorType,
    _BeanCollection,
} from 'ag-grid-community';

import { AgMenuList } from '../agStack/agMenuList';
import { MENU_ITEM_CALLBACKS } from './menuItemComponent';

export class MenuList extends AgMenuList<
    _BeanCollection,
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService,
    _AgComponentSelectorType,
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
